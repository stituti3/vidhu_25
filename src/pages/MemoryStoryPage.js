import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786728784';
import { soundService } from '../services/soundEngine.js?v=1786728784';
import { letterStorage } from '../services/letterStorage.js?v=1786728784';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const MemoryStoryPage = ({ onNavigate, onSelectMemory, isContributorMode = false }) => {
  const [displayMemories, setDisplayMemories] = useState([]);
  const [memoryPendingDelete, setMemoryPendingDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Drag and Drop State
  const [draggedMemId, setDraggedMemId] = useState(null);
  const [dragOverMemId, setDragOverMemId] = useState(null);
  
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
      onSelectMemory(mem, displayMemories);
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

  const handleInlineCaptionChange = (mem, newCaption) => {
    if (mem.isCustom) {
      letterStorage.updateMemoryCaption(mem.id, newCaption);
      // We don't need to manually update state here because letterStorage.subscribe will fire refreshMemories().
      // However, for immediate feedback without cursor jumping, we can update local state.
      setDisplayMemories(prev => prev.map(m => m.id === mem.id ? { ...m, caption: newCaption } : m));
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, id) => {
    setDraggedMemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // Required for Firefox
  };

  const handleDragOver = (e, id) => {
    e.preventDefault(); // Necessary to allow drop
    if (id !== dragOverMemId) {
      setDragOverMemId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedMemId(null);
    setDragOverMemId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedMemId || draggedMemId === targetId) {
      handleDragEnd();
      return;
    }

    const draggedIndex = displayMemories.findIndex((m) => m.id === draggedMemId);
    const targetIndex = displayMemories.findIndex((m) => m.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newList = [...displayMemories];
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);
      
      setDisplayMemories(newList);
      
      // Save new order to storage
      letterStorage.saveMemoryOrder(newList.map(m => m.id));
      soundService.playClick();
    }
    handleDragEnd();
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
          const maxDim = 600;
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    setProcessingStatus(`Processing ${files.length} files...`);
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const url = await processImageFile(file);
        if (url) {
          newItems.push({ id: `media-${Date.now()}-${i}`, type: 'image', url, caption: '' });
        }
      } else if (file.type.startsWith('video/')) {
        const url = await processVideoFile(file);
        if (url) {
          newItems.push({ id: `media-${Date.now()}-${i}`, type: 'video', url, caption: '' });
        }
      }
    }

    if (newItems.length > 0) {
      setMediaList((prev) => [...prev, ...newItems]);
      soundService.playSparkle();
    }
    setIsProcessingMedia(false);
    setProcessingStatus('');
  };

  const handleUpdateMediaCaption = (idToUpdate, newCaption) => {
    setMediaList((prev) => prev.map((item) => (item.id === idToUpdate ? { ...item, caption: newCaption } : item)));
  };

  const handleRemoveMediaItem = (idToRemove) => {
    setMediaList((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleSavePolaroid = () => {
    if (mediaList.length === 0) return;
    soundService.playClick();
    
    mediaList.forEach(item => {
      letterStorage.addCustomMemory({
        type: item.type,
        url: item.url,
        caption: item.caption
      });
    });

    setToastMessage(`Added ${mediaList.length} items to the Polaroid Wall ✓`);
    setTimeout(() => setToastMessage(''), 3500);
    closeAddModal();
    refreshMemories();
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setMediaList([]);
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
              className=${`polaroid-frame ${mem.type === 'video' ? 'polaroid-frame-video' : ''} ${draggedMemId === mem.id ? 'polaroid-dragging' : ''} ${dragOverMemId === mem.id ? 'polaroid-drag-over' : ''}`}
              style=${{
                '--rot': `${mem.rotation || (idx % 2 === 0 ? -1.8 : 1.8)}deg`,
                '--tape-rot': `${(idx % 3 === 0 ? -2 : (idx % 3 === 1 ? 1.5 : -0.8))}deg`
              }}
              draggable=${true}
              onDragStart=${(e) => handleDragStart(e, mem.id)}
              onDragOver=${(e) => handleDragOver(e, mem.id)}
              onDragEnd=${handleDragEnd}
              onDrop=${(e) => handleDrop(e, mem.id)}
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
                      playsinline
                      controls
                      className="polaroid-embedded-video"
                      style=${{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onClick=${(e) => e.stopPropagation()}
                    ></video>
                  </div>
                ` : html`
                  <img src=${mem.image} alt=${mem.title || `Memory ${idx + 1}`} loading="lazy" />
                `}
              </div>

              <!-- Uniform Bottom Note Area with Handwriting Font -->
              <div className="polaroid-footer-area" onClick=${(e) => e.stopPropagation()}>
                ${mem.isCustom ? html`
                  <input
                    type="text"
                    className="polaroid-caption font-handwriting"
                    style=${{ background: 'transparent', border: 'none', width: '100%', textAlign: 'center', margin: 0, padding: 0 }}
                    placeholder=""
                    value=${mem.caption || ''}
                    onChange=${(e) => handleInlineCaptionChange(mem, e.target.value)}
                  />
                ` : html`
                  ${mem.caption && html`
                    <div className="polaroid-caption font-handwriting">
                      ${mem.caption}
                    </div>
                  `}
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
            
            ${mediaList.length === 0 ? html`
              <div style=${{ margin: '20px 0' }}>
                <p className="delete-modal-desc" style=${{ marginBottom: '15px' }}>Choose pictures or short videos to hang on the wall. You can select multiple at once!</p>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple
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
                  ${isProcessingMedia ? processingStatus : 'Select Files'}
                </button>
              </div>
            ` : html`
              <div style=${{ margin: '15px 0', maxHeight: '60vh', overflowY: 'auto' }}>
                <p className="delete-modal-desc" style=${{ marginBottom: '15px' }}>You are adding ${mediaList.length} items.</p>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  ${mediaList.map((item) => html`
                    <div key=${item.id} style=${{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8f4eb', padding: '10px', borderRadius: '8px' }}>
                      <div className="polaroid-photo-container" style=${{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                        ${item.type === 'video' ? html`
                          <video src=${item.url} style=${{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsinline></video>
                        ` : html`
                          <img src=${item.url} style=${{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        `}
                      </div>
                      <div style=${{ flexGrow: 1 }}>
                        <input
                          type="text"
                          placeholder="Optional caption..."
                          className="share-url-input font-handwriting"
                          style=${{ width: '100%', boxSizing: 'border-box', fontSize: '1.2rem', padding: '6px 10px', margin: 0 }}
                          value=${item.caption}
                          onChange=${(e) => handleUpdateMediaCaption(item.id, e.target.value)}
                        />
                      </div>
                      <button type="button" onClick=${() => handleRemoveMediaItem(item.id)} style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                        ❌
                      </button>
                    </div>
                  `)}
                </div>
                
                <div style=${{ marginTop: '15px' }}>
                  <input 
                    type="file" 
                    accept="image/*,video/*" 
                    multiple
                    ref=${fileInputRef} 
                    onChange=${handleMediaFileChange} 
                    style=${{ display: 'none' }}
                  />
                  <button 
                    className="btn btn-secondary" 
                    onClick=${() => fileInputRef.current.click()}
                    disabled=${isProcessingMedia}
                    style=${{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                  >
                    ${isProcessingMedia ? processingStatus : '+ Add More Files'}
                  </button>
                </div>
              </div>
            `}

            <div className="delete-modal-actions">
              <button type="button" onClick=${closeAddModal} className="btn btn-secondary">
                <span>Cancel</span>
              </button>
              ${mediaList.length > 0 && html`
                <button type="button" onClick=${handleSavePolaroid} className="btn btn-gold">
                  <span>Post All to Wall</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `}

    </section>
  `;
};
