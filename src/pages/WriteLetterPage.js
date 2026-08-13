import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786612520';
import { soundService } from '../services/soundEngine.js?v=1786612520';
import { letterStorage } from '../services/letterStorage.js?v=1786612520';
import { launchConfetti } from '../components/ConfettiLauncher.js?v=1786612520';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const WriteLetterPage = ({ onNavigate, initialMode, isContributorMode = false }) => {
  const { celebrant } = BIRTHDAY_CONFIG;
  const existingLetter = letterStorage.getMyLetter();

  // If a letter already exists and no specific initialMode was forced, start in 'view' mode, otherwise 'compose'
  const [viewState, setViewState] = useState(
    initialMode || (existingLetter ? 'view' : 'compose')
  );

  // Form State - Freeform handwritten letter with multiple photos & videos
  const [message, setMessage] = useState(existingLetter?.message || '');
  
  // Media List state (array of { id, type: 'image'|'video', url, caption, name })
  const [mediaList, setMediaList] = useState(() => {
    if (existingLetter?.media && Array.isArray(existingLetter.media)) {
      return existingLetter.media;
    }
    if (existingLetter?.image) {
      return [{
        id: `media-init-0`,
        type: 'image',
        url: existingLetter.image,
        caption: existingLetter.caption || '',
        name: 'Photo Memory'
      }];
    }
    return [];
  });

  const [savedLetter, setSavedLetter] = useState(existingLetter);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const fileInputRef = useRef(null);

  // Compress and process an individual image file
  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve({
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: 'image',
            url: compressedDataUrl,
            caption: '',
            name: file.name
          });
        };
        img.onerror = () => resolve(null);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Process video file
  const processVideoFile = (file) => {
    return new Promise((resolve) => {
      // 35MB max client-side guard
      if (file.size > 35 * 1024 * 1024) {
        alert(`Video "${file.name}" is too large (over 35MB). Please choose a shorter clip.`);
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({
          id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'video',
          url: event.target.result,
          caption: '',
          name: file.name
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Multi-File Upload Handler (Images & Videos)
  const handleMediaFilesChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    setProcessingStatus(`Uploading & preparing ${files.length} ${files.length === 1 ? 'file' : 'files'}...`);

    const newItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingStatus(`Processing ${file.name} (${i + 1}/${files.length})...`);

      if (file.type.startsWith('image/')) {
        const item = await processImageFile(file);
        if (item) newItems.push(item);
      } else if (file.type.startsWith('video/')) {
        const item = await processVideoFile(file);
        if (item) newItems.push(item);
      } else {
        alert(`File "${file.name}" is not a recognized image or video.`);
      }
    }

    if (newItems.length > 0) {
      setMediaList((prev) => [...prev, ...newItems]);
      soundService.playSparkle();
    }

    setIsProcessingMedia(false);
    setProcessingStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove an individual media item
  const handleRemoveMediaItem = (idToRemove) => {
    soundService.playClick();
    setMediaList((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Update caption for a specific media item
  const handleUpdateMediaCaption = (idToUpdate, newCaption) => {
    setMediaList((prev) =>
      prev.map((item) => (item.id === idToUpdate ? { ...item, caption: newCaption } : item))
    );
  };

  // Submit and Seal the Letter with all attached Media
  const handleSubmitLetter = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert(`Please write a letter for ${celebrant.nickname || celebrant.name} before sealing.`);
      return;
    }

    soundService.playClick();
    soundService.playSparkle();

    const saved = letterStorage.saveMyLetter({
      sender: '',
      relation: '',
      title: `Letter for ${celebrant.nickname || celebrant.name}`,
      message: message.trim(),
      media: mediaList,
      image: mediaList[0]?.url || null,
      caption: mediaList[0]?.caption || ''
    });

    setSavedLetter(saved);
    launchConfetti('fireworks');

    // Return to Letters desk in full mode, or Memories/Envelope in contributor mode
    setTimeout(() => {
      onNavigate(isContributorMode ? 'memories' : 'letters');
    }, 450);
  };

  const imageCount = mediaList.filter((m) => m.type === 'image').length;
  const videoCount = mediaList.filter((m) => m.type === 'video').length;

  return html`
    <section className="stationery-content-section write-letter-section">
      
      <!-- Notification Toast -->
      ${toastMessage && html`
        <div className="composer-toast-banner font-rebecca">
          ${toastMessage}
        </div>
      `}

      <!-- ========================================== -->
      <!-- 1. FREEFORM HANDWRITTEN COMPOSER MODE      -->
      <!-- ========================================== -->
      ${viewState === 'compose' && html`
        <div className="composer-container freeform-composer-wrap">
          
          <!-- Warm Header -->
          <div className="card-vintage-header warm-polaroid-header">
            <h1 className="hero-title font-rebecca-title warm-heading">
              ${savedLetter ? `Edit Your Letter to ${celebrant.nickname || celebrant.name} ♡` : `Write Your Letter to ${celebrant.nickname || celebrant.name} ♡`}
            </h1>
            <p className="composer-sub-guide">
              Write your heartfelt note and attach memorable photos & videos for his 25th birthday.
            </p>
          </div>

          <form onSubmit=${handleSubmitLetter} className="composer-form-parchment torn-paper-composer-card">
            
            <!-- Spacious Handwritten Letter Textarea with Authentic Torn Paper Look -->
            <div className="composer-field-group">
              <textarea
                className="handwritten-letter-textarea"
                placeholder="Dear Vidhanth,&#10;&#10;Happy 25th Birthday! Write whatever comes to your heart...&#10;&#10;— With love / Cheers / Best wishes,&#10;[Your Name]"
                rows="10"
                value=${message}
                onInput=${(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <!-- ========================================== -->
            <!-- MULTI-PICTURE & VIDEO ATTACHMENT SECTION   -->
            <!-- ========================================== -->
            <div className="composer-multi-media-section">
              <div className="media-section-header">
                <div>
                  <label className="composer-label photo-box-title">
                    Attach Photos & Videos for the Polaroid Wall <span className="opt-tag">(Optional)</span>
                  </label>
                  <p className="media-section-subtitle">
                    Upload multiple pictures or short video clips. Each one will be pinned on Vidhanth's Polaroid Memory Wall!
                  </p>
                </div>

                ${mediaList.length > 0 && html`
                  <div className="media-count-badge">
                    ${imageCount > 0 && `${imageCount} 📷`}
                    ${imageCount > 0 && videoCount > 0 && ' • '}
                    ${videoCount > 0 && `${videoCount} 🎬`}
                  </div>
                `}
              </div>

              <!-- Multi-file input (Hidden) -->
              <input
                type="file"
                ref=${fileInputRef}
                onChange=${handleMediaFilesChange}
                accept="image/*,video/*"
                multiple
                style=${{ display: 'none' }}
              />

              <!-- Preview Grid of all attached media -->
              ${mediaList.length > 0 && html`
                <div className="composer-media-grid">
                  ${mediaList.map((item, idx) => html`
                    <div key=${item.id || idx} className="composer-media-card">
                      <div className="polaroid-washi-tape"></div>
                      
                      <!-- Delete item button -->
                      <button
                        type="button"
                        className="btn-remove-media-item"
                        onClick=${() => handleRemoveMediaItem(item.id)}
                        title="Remove this item"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>

                      <!-- Type indicator badge for videos -->
                      ${item.type === 'video' && html`
                        <div className="media-type-pill video-pill">
                          🎬 Video Clip
                        </div>
                      `}

                      <!-- Preview Area -->
                      <div className="composer-media-preview-box">
                        ${item.type === 'video' ? html`
                          <video
                            src=${item.url}
                            controls
                            playsinline
                            className="composer-video-preview"
                          ></video>
                        ` : html`
                          <img
                            src=${item.url}
                            alt=${item.name || `Attachment ${idx + 1}`}
                            className="composer-img-preview"
                          />
                        `}
                      </div>

                      <!-- Individual Caption Input -->
                      <div className="composer-media-caption-box">
                        <input
                          type="text"
                          className="composer-caption-input font-handwriting"
                          placeholder="Add caption for this memory... (Optional)"
                          value=${item.caption || ''}
                          onInput=${(e) => handleUpdateMediaCaption(item.id, e.target.value)}
                        />
                      </div>
                    </div>
                  `)}
                </div>
              `}

              <!-- Add Files Dropzone / Action Button -->
              <div
                className=${`photo-upload-dropzone simple-upload-box ${mediaList.length > 0 ? 'dropzone-compact' : ''}`}
                onClick=${() => !isProcessingMedia && fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="dropzone-icon">
                  ${isProcessingMedia ? '⏳' : (mediaList.length > 0 ? '➕' : '📷 🎬')}
                </div>
                <div className="dropzone-text">
                  ${isProcessingMedia
                    ? (processingStatus || 'Processing media...')
                    : (mediaList.length > 0
                        ? '+ Add more photos or videos'
                        : 'Click to select multiple photos and videos')}
                </div>
                <div className="dropzone-subtext">
                  Supports JPG, PNG, WEBP, GIF, MP4, MOV, WEBM (Upload multiple at once)
                </div>
              </div>

            </div>

            <!-- Actions Row -->
            <div className="composer-actions-bar">
              ${savedLetter && html`
                <button
                  type="button"
                  onClick=${() => {
                    soundService.playClick();
                    setViewState('view');
                  }}
                  className="btn btn-secondary"
                >
                  <span>Cancel</span>
                </button>
              `}

              <button
                type="submit"
                className="btn btn-gold btn-seal-letter"
                disabled=${isProcessingMedia}
              >
                <span>Seal & Save Letter 💌</span>
              </button>
            </div>

          </form>

        </div>
      `}

      <!-- ========================================== -->
      <!-- 2. HANDWRITTEN TORN-EDGE LETTER VIEW       -->
      <!-- ========================================== -->
      ${viewState === 'view' && savedLetter && html`
        <div className="personal-letter-view-container">
          
          <!-- Warm Header -->
          <div className="card-vintage-header warm-polaroid-header">
            <h1 className="hero-title font-rebecca-title warm-heading">
              Your Letter to ${celebrant.nickname || celebrant.name} ♡
            </h1>
            <p className="composer-sub-guide">
              Sealed on handcrafted torn parchment paper.
            </p>
          </div>

          <!-- Realistic Torn-Edge Handwritten Parchment Sheet -->
          <div className="torn-letter-wrapper">
            <div className="torn-parchment-sheet">
              
              <!-- Subtle Paper Texture Fibers & Vignette -->
              <div className="torn-paper-fibers"></div>

              <!-- Main Handwritten Body Content -->
              <div className="torn-letter-body-text">
                ${savedLetter.message}
              </div>

              <!-- Attached Media Strip (If contributor attached photos/videos) -->
              ${mediaList.length > 0 && html`
                <div className="letter-attached-gallery">
                  <div className="attached-gallery-title font-rebecca">
                    📎 Attached Memories (${mediaList.length})
                  </div>
                  <div className="attached-gallery-row">
                    ${mediaList.map((item, idx) => html`
                      <div key=${item.id || idx} className="attached-gallery-item">
                        ${item.type === 'video' ? html`
                          <div className="attached-video-thumb">
                            <video src=${item.url} muted preload="metadata"></video>
                            <span className="thumb-video-icon">▶</span>
                          </div>
                        ` : html`
                          <img src=${item.url} alt="Attached Memory" className="attached-img-thumb" />
                        `}
                        ${item.caption && html`
                          <div className="attached-thumb-caption font-handwriting">
                            ${item.caption}
                          </div>
                        `}
                      </div>
                    `)}
                  </div>
                </div>
              `}

              <!-- Authentic Bottom Wax Seal Stamp Pressed on Paper -->
              <div className="torn-letter-seal-stamp wax-seal" title="Sealed with love">
                <div className="wax-seal-inner-disc">
                  <svg viewBox="0 0 100 100" className="wax-seal-icon wax-emblem-v">
                    <text
                      x="42"
                      y="69"
                      textAnchor="middle"
                      className="wax-v-shadow"
                      transform="translate(1.5, 1.5)"
                      style=${{ fontFamily: "'GreatVibesRegular', 'Great Vibes', cursive", fontSize: '66px', fontWeight: 'normal' }}
                    >
                      V
                    </text>
                    <text
                      x="42"
                      y="69"
                      textAnchor="middle"
                      className="wax-v-main"
                      style=${{ fontFamily: "'GreatVibesRegular', 'Great Vibes', cursive", fontSize: '66px', fontWeight: 'normal' }}
                    >
                      V
                    </text>
                  </svg>
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Action Navigation -->
          <div className="stationery-bottom-nav">
            <button
              onClick=${() => {
                soundService.playClick();
                onNavigate(isContributorMode ? 'memories' : 'letters');
              }}
              className="btn btn-secondary"
            >
              <span>${isContributorMode ? '← Back to Memories' : '← Back to Letters Desk'}</span>
            </button>

            <button
              onClick=${() => {
                soundService.playClick();
                setViewState('compose');
              }}
              className="btn btn-gold"
            >
              <span>✎ Edit My Letter</span>
            </button>
          </div>

        </div>
      `}

    </section>
  `;
};
