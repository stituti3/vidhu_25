import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786612520';
import { soundService } from '../services/soundEngine.js?v=1786612520';
import { letterStorage } from '../services/letterStorage.js?v=1786612520';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const MemoryStoryPage = ({ onNavigate, onSelectMemory, isContributorMode = false }) => {
  const [displayMemories, setDisplayMemories] = useState([]);
  const [memoryPendingDelete, setMemoryPendingDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState(null);
  const [newMediaType, setNewMediaType] = useState('image');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  
  const fileInputRef = useRef(null);

  const refreshMemories = () => {
    if (isContributorMode) {
      setDisplayMemories(letterStorage.getMyUploadedMemories());
    } else {
      setDisplayMemories(letterStorage.getAllMemories(BIRTHDAY_CONFIG.memories));
    }
  };

  useEffect(() => {
    refreshMemories();
    // Fetch latest community letters & photos from server
    letterStorage.fetchCommunityLetters().then(() => refreshMemories());

    // Subscribe to state updates (e.g. when letters/photos/videos are added or deleted)
    const unsubscribe = letterStorage.subscribe(() => {
      refreshMemories();
    });
    return unsubscribe;
  }, [isContributorMode]);

  const handleCardClick = (mem) => {
    soundService.playSparkle();
    if (onSelectMemory) {
      onSelectMemory(mem);
    }
  };

  const handleRequestDeleteMemory = (e, mem) => {
    e.stopPropagation();
    soundService.playClick();
    setMemoryPendingDelete(mem);
  };

  const handleConfirmDeleteMemory = () => {
    if (!memoryPendingDelete) return;

    soundService.playClick();
    const targetId = memoryPendingDelete.id;
    const title = memoryPendingDelete.title || memoryPendingDelete.caption || (memoryPendingDelete.type === 'video' ? 'Video' : 'Photo');

    letterStorage.deleteMemory(targetId);
    setMemoryPendingDelete(null);

    // Refresh remaining memories
    refreshMemories();

    // Show toast
    setToastMessage(`"${title}" has been removed from the wall ✓`);
    setTimeout(() => setToastMessage(''), 3500);
  };

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
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(null);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processVideoFile = (file) => {
    return new Promise((resolve) => {
      if (file.size > 35 * 1024 * 1024) {
        alert(`Video is too large (over 35MB). Please choose a shorter clip.`);
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleMediaFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingMedia(true);
    let url = null;
    let type = 'image';

    if (file.type.startsWith('image/')) {
      url = await processImageFile(file);
    } else if (file.type.startsWith('video/')) {
      url = await processVideoFile(file);
      type = 'video';
    } else {
      alert('Unrecognized file type.');
    }

    if (url) {
      setNewMediaUrl(url);
      setNewMediaType(type);
      soundService.playSparkle();
    }
    setIsProcessingMedia(false);
  };

  const handleSavePolaroid = () => {
    if (!newMediaUrl) return;
    soundService.playClick();
    letterStorage.addCustomMemory({
      type: newMediaType,
      url: newMediaUrl,
      caption: newMediaCaption
    });
    setToastMessage('Added to the Polaroid Wall ✓');
    setTimeout(() => setToastMessage(''), 3500);
    closeAddModal();
    refreshMemories();
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewMediaUrl(null);
    setNewMediaCaption('');
    setNewMediaType('image');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return html`
    <section className="stationery-content-section polaroid-wall-section">
      
      <!-- Toast Notification -->
      ${toastMessage && html`
        <div className="composer-toast-banner font-rebecca">
          ${toastMessage}
        </div>
      `}

      <!-- Warm Heartfelt Header -->
      <div className="card-vintage-header warm-polaroid-header">
        <h1 className="hero-title font-rebecca-title warm-heading">
          ${isContributorMode ? 'Your Photos & Videos for Vidhanth' : 'The Archive: First Quarter'}
        </h1>
      </div>

      <!-- Dynamic Aesthetic Polaroid Wall -->
      ${displayMemories.length > 0 ? html`
        <div className="polaroid-wall-collage">
          ${displayMemories.map((mem, idx) => html`
            <div
              key=${mem.id || idx}
              className=${`polaroid-frame ${mem.type === 'video' ? 'polaroid-frame-video' : ''}`}
              style=${{
                '--rot': `${mem.rotation || (idx % 2 === 0 ? -1.8 : 1.8)}deg`,
                '--tape-rot': `${(idx % 3 === 0 ? -2 : (idx % 3 === 1 ? 1.5 : -0.8))}deg`
              }}
              onClick=${() => handleCardClick(mem)}
              title=${mem.type === 'video' ? 'Click to play video' : 'Click to view photo'}
            >
              <!-- Minimalist Translucent Washi Tape Strip -->
              <div className="polaroid-washi-tape"></div>

              <!-- Video Pill Indicator if it's a video -->
              ${mem.type === 'video' && html`
                <div className="polaroid-video-badge">
                  🎬 Video
                </div>
              `}

              <!-- Delete Polaroid Quick Button -->
              <button
                type="button"
                className="btn-polaroid-delete"
                onClick=${(e) => handleRequestDeleteMemory(e, mem)}
                title="Delete this item"
                aria-label="Delete item"
              >
                🗑️
              </button>

              <!-- Photo or Video Area (Square Aspect Ratio) -->
              <div className="polaroid-photo-container">
                ${mem.type === 'video' ? html`
                  <div className="polaroid-video-wrapper">
                    <video
                      src=${mem.videoUrl || mem.image}
                      preload="metadata"
                      muted
                      playsinline
                      className="polaroid-embedded-video"
                    ></video>
                    <div className="polaroid-play-overlay">
                      <span className="polaroid-play-btn-circle">▶</span>
                    </div>
                  </div>
                ` : html`
                  <img src=${mem.image} alt=${mem.title || `Memory ${idx + 1}`} loading="lazy" />
                `}
              </div>

              <!-- Uniform Bottom Note Area with Handwriting Font -->
              <div className="polaroid-footer-area">
                ${mem.caption && html`
                  <div className="polaroid-caption font-handwriting">
                    ${mem.caption}
                  </div>
                `}
                ${mem.date && html`
                  <div className="polaroid-date-stamp font-handwriting-sub">
                    ${mem.date}
                  </div>
                `}
              </div>
            </div>
          `)}
        </div>
      ` : html`
        <!-- Empty State when no photos/videos are on the wall -->
        <div className="contributor-no-photos-card">
          <div className="no-photos-icon">📷 🎬</div>
          <h3 className="no-photos-title font-rebecca">
            ${isContributorMode ? 'No Photos or Videos Uploaded Yet' : 'No Memories on the Polaroid Wall'}
          </h3>
          <p className="no-photos-desc">
            ${isContributorMode
              ? 'You can upload multiple photos and videos with custom captions when writing your birthday letter to Vidhanth!'
              : 'All photos and videos have been removed or none were uploaded yet. Friends can attach photos and video clips when writing their letters!'}
          </p>
          ${isContributorMode && html`
            <button
              onClick=${() => {
                soundService.playClick();
                onNavigate('write_letter');
              }}
              className="btn btn-gold btn-write-now"
            >
              <span>✍️ Write Letter & Attach Photos / Videos</span>
            </button>
          `}
        </div>
      `}

      <!-- Bottom Navigation -->
      <div className="stationery-bottom-nav">
        <button
          onClick=${() => {
            soundService.playClick();
            onNavigate('landing');
          }}
          className="btn btn-secondary"
        >
          <span>← Cover</span>
        </button>

        ${isContributorMode ? html`
          <button
            onClick=${() => {
              soundService.playClick();
              onNavigate('write_letter');
            }}
            className="btn btn-gold"
          >
            <span>✍️ Your Letter →</span>
          </button>
        ` : html`
          <button
            onClick=${() => {
              soundService.playClick();
              onNavigate('letters');
            }}
            className="btn btn-gold"
          >
            <span>Read Letters →</span>
          </button>
        `}
      </div>

      <!-- Delete Confirmation Modal Dialog -->
      ${memoryPendingDelete && html`
        <div className="delete-confirm-backdrop" onClick=${() => setMemoryPendingDelete(null)}>
          <div className="delete-confirm-modal" onClick=${(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h3 className="delete-modal-title font-rebecca">
              Delete This ${memoryPendingDelete.type === 'video' ? 'Video' : 'Photo'}?
            </h3>
            <p className="delete-modal-desc">
              Are you sure you want to remove this ${memoryPendingDelete.type === 'video' ? 'video' : 'photo'} from the Polaroid Wall?
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick=${() => {
                  soundService.playClick();
                  setMemoryPendingDelete(null);
                }}
                className="btn btn-secondary"
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick=${handleConfirmDeleteMemory}
                className="btn btn-danger-delete"
              >
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      `}

      <!-- Floating Action Button to Add Polaroids -->
      <button 
        className="btn-add-polaroid-fab"
        onClick=${() => setIsAddModalOpen(true)}
        aria-label="Add Polaroid"
        title="Add a photo or video to the wall"
      >
        📷
      </button>

      <!-- Add Polaroid Modal -->
      ${isAddModalOpen && html`
        <div className="delete-confirm-backdrop" onClick=${closeAddModal}>
          <div className="delete-confirm-modal" onClick=${(e) => e.stopPropagation()} style=${{ maxWidth: '400px' }}>
            <h3 className="delete-modal-title font-rebecca">Add to Polaroid Wall</h3>
            
            ${!newMediaUrl ? html`
              <div style=${{ margin: '20px 0' }}>
                <p className="delete-modal-desc" style=${{ marginBottom: '15px' }}>Choose a picture or short video to hang on the wall.</p>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  ref=${fileInputRef} 
                  onChange=${handleMediaFileChange} 
                  style=${{ display: 'none' }}
                />
                <button 
                  className="btn btn-gold" 
                  onClick=${() => fileInputRef.current.click()}
                  disabled=${isProcessingMedia}
                  style=${{ width: '100%' }}
                >
                  ${isProcessingMedia ? 'Processing...' : 'Select File'}
                </button>
              </div>
            ` : html`
              <div style=${{ margin: '15px 0' }}>
                <div className="polaroid-photo-container" style=${{ width: '150px', height: '150px', margin: '0 auto 15px', borderRadius: '4px', overflow: 'hidden' }}>
                  ${newMediaType === 'video' ? html`
                    <video src=${newMediaUrl} className="polaroid-embedded-video" muted playsinline autoPlay loop></video>
                  ` : html`
                    <img src=${newMediaUrl} style=${{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  `}
                </div>
                <input
                  type="text"
                  placeholder="Add a cute caption..."
                  className="share-url-input font-handwriting"
                  style=${{ width: '100%', boxSizing: 'border-box', fontSize: '1.2rem', padding: '10px' }}
                  value=${newMediaCaption}
                  onChange=${(e) => setNewMediaCaption(e.target.value)}
                />
              </div>
            `}

            <div className="delete-modal-actions">
              <button type="button" onClick=${closeAddModal} className="btn btn-secondary">
                <span>Cancel</span>
              </button>
              ${newMediaUrl && html`
                <button type="button" onClick=${handleSavePolaroid} className="btn btn-gold">
                  <span>Post to Wall</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `}

    </section>
  `;
};
