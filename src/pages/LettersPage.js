import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786637514';
import { soundService } from '../services/soundEngine.js?v=1786637514';
import { letterStorage } from '../services/letterStorage.js?v=1786637514';
import { ShareModal } from '../components/ShareModal.js?v=1786637514';

const { useState, useEffect } = window.React;
const html = window.htm.bind(window.React.createElement);

export const LettersPage = ({ onNavigate }) => {
  const { letters: defaultLetters } = BIRTHDAY_CONFIG;
  const [allLetters, setAllLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [letterPendingDelete, setLetterPendingDelete] = useState(null);
  const [activeMediaPreview, setActiveMediaPreview] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // Drag and Drop State
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);

  const refreshLetters = (preferredId = null) => {
    const list = letterStorage.getAllLetters(defaultLetters);
    setAllLetters(list);

    if (list.length === 0) {
      setSelectedLetter(null);
      return;
    }

    if (preferredId) {
      const match = list.find((l) => l.id === preferredId);
      if (match) {
        setSelectedLetter(match);
        return;
      }
    }

    // Default to currently selected if still present, otherwise first letter
    setSelectedLetter((prev) => {
      if (prev && list.some((l) => l.id === prev.id)) {
        return list.find((l) => l.id === prev.id);
      }
      return list[0];
    });
  };

  useEffect(() => {
    refreshLetters();

    // Fetch latest submitted letters from server API (from phone / cross-device)
    letterStorage.fetchCommunityLetters().then(() => {
      refreshLetters();
    });

    // Subscribe to changes in real-time
    const unsubscribe = letterStorage.subscribe(() => {
      refreshLetters();
    });
    return unsubscribe;
  }, []);

  const handleSelectLetter = (letItem) => {
    soundService.playClick();
    setSelectedLetter(letItem);
  };

  const handleNextPage = () => {
    soundService.playClick();
    onNavigate('cake');
  };

  const handleOpenShare = () => {
    soundService.playSparkle();
    setIsShareModalOpen(true);
  };

  // Prompt confirmation before deletion
  const handleRequestDelete = (e, letItem) => {
    e.stopPropagation();
    soundService.playClick();
    setLetterPendingDelete(letItem);
  };

  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // Required for Firefox
  };

  const handleDragOver = (e, id) => {
    e.preventDefault(); // Necessary to allow drop
    if (id !== dragOverItemId) {
      setDragOverItemId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = draggedItemId;
    if (!sourceId || sourceId === targetId) {
      handleDragEnd();
      return;
    }

    const currentOrder = allLetters.map(l => l.id);
    const sourceIdx = currentOrder.indexOf(sourceId);
    const targetIdx = currentOrder.indexOf(targetId);

    if (sourceIdx > -1 && targetIdx > -1) {
      const newOrder = [...currentOrder];
      const [removed] = newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, removed);
      
      // Save
      letterStorage.saveLetterOrder(newOrder);
      
      // Update local state immediately for snappy feel
      const newLetters = newOrder.map(id => allLetters.find(l => l.id === id));
      setAllLetters(newLetters);
    }
    
    soundService.playSparkle(); // playful sound on reorder
    handleDragEnd();
  };

  // Confirm and execute letter deletion
  const handleConfirmDelete = () => {
    if (!letterPendingDelete) return;

    soundService.playClick();
    const deletedId = letterPendingDelete.id;
    const deletedTitle = letterPendingDelete.title || letterPendingDelete.sender || 'Letter';

    letterStorage.deleteLetter(deletedId);
    setLetterPendingDelete(null);

    // Refresh remaining letters
    const remaining = letterStorage.getAllLetters(defaultLetters);
    setAllLetters(remaining);
    setSelectedLetter(remaining.length > 0 ? remaining[0] : null);

    // Show feedback toast
    setToastMessage(`"${deletedTitle}" has been deleted ✓`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return html`
    <section className="stationery-content-section letters-section">
      
      <!-- Toast Notification -->
      ${toastMessage && html`
        <div className="composer-toast-banner font-rebecca">
          ${toastMessage}
        </div>
      `}

      <!-- Warm Header -->
      <div className="card-vintage-header warm-polaroid-header" style=${{ textAlign: 'center' }}>
        <h1 className="hero-title font-rebecca-title warm-heading" style=${{ margin: '0', display: 'inline-block' }}>
          The Archive: First Quarter
        </h1>
        <p className="letters-count-sub font-rebecca" style=${{ fontSize: '2.2rem', margin: '8px 0 0 0', fontStyle: 'italic' }}>
          letters of love
        </p>
      </div>

      <!-- Main Letters Desk View -->
      ${allLetters.length > 0 ? html`
        <div className="letters-reading-layout">
          
          <!-- Left: Folded Letter Tabs Stack with Delete Action -->
          <div className="letters-selector-list" role="tablist" aria-label="Birthday letters">
            ${allLetters.map((letItem) => html`
              <div
                key=${letItem.id}
                draggable="true"
                onDragStart=${(e) => handleDragStart(e, letItem.id)}
                onDragOver=${(e) => handleDragOver(e, letItem.id)}
                onDragLeave=${() => setDragOverItemId(null)}
                onDrop=${(e) => handleDrop(e, letItem.id)}
                onDragEnd=${handleDragEnd}
                onClick=${() => handleSelectLetter(letItem)}
                className=${`letter-tab-btn ${selectedLetter && selectedLetter.id === letItem.id ? 'active' : ''} ${letItem.isCustom ? 'community-tab' : ''}`}
                style=${{
                  opacity: draggedItemId === letItem.id ? 0.5 : 1,
                  transform: dragOverItemId === letItem.id ? 'scale(1.02) translateX(10px)' : 'scale(1)',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  borderTop: dragOverItemId === letItem.id ? '2px dashed rgba(193,155,108,0.5)' : 'none',
                }}
                role="tab"
                aria-selected=${selectedLetter && selectedLetter.id === letItem.id}
              >
                <div className="letter-tab-tag-content">
                  <div className="tag-hole-container">
                    <div className="tag-string"></div>
                    <div className="tag-hole"></div>
                  </div>
                  
                  <div className="tag-text">
                    <span className="tag-label">From:</span>
                    <span className="tag-name font-handwriting">
                      ${letItem.sender || (letItem.isCustom ? 'A Friend' : 'Loved One')}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    className="btn-tab-quick-delete"
                    onClick=${(e) => handleRequestDelete(e, letItem)}
                    title="Delete this letter"
                    aria-label="Delete letter"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            `)}
          </div>

          <!-- Right: Unfolded Stationery Paper Sheet -->
          ${selectedLetter && html`
            <div className="letter-unfolded-view">
              <div className="letter-parchment-sheet love-letter-style" style=${{ position: 'relative' }}>
                
                <!-- New Header Layout -->
                <div className="love-letter-header" style=${{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0' }}>
                  <button
                    type="button"
                    className="btn-delete-love-letter"
                    onClick=${(e) => handleRequestDelete(e, selectedLetter)}
                    title="Delete this letter from desk"
                  >
                    ✕
                  </button>
                </div>

                <div className="love-letter-meta-row" style=${{ marginTop: '-20px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="love-letter-date">
                    <span className="date-number" style=${{ fontSize: '1.6rem' }}>14th august</span>
                  </div>
                  <div className="love-letter-stamps">
                    <div className="decorative-stamp heart-stamp">
                      <span className="stamp-icon">🎈</span>
                      <span className="stamp-text">POSTAGE</span>
                    </div>
                  </div>
                </div>

                <!-- Main Content Layout -->
                <div className="personal-letter-content-layout">
                  <div className="letter-sheet-body personal-sheet-body">
                    <p className="letter-text-content love-letter-text">
                      ${selectedLetter.message}
                    </p>
                  </div>
                </div>

                <!-- Footer with Postmark -->
                <div className="love-letter-footer" style=${{ marginTop: '20px', alignItems: 'flex-end' }}>
                  <div className="love-letter-footer-left" style=${{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="love-letter-from-bottom">
                      <div className="to-from-line">
                        <span className="to-from-label">FROM:</span>
                        <span className="to-from-value font-handwriting">${selectedLetter.sender || 'A Friend'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="love-letter-postmark">
                    <div className="postmark-circle"></div>
                    <div className="postmark-lines">
                      <div className="pm-line"></div>
                      <div className="pm-line"></div>
                      <div className="pm-line"></div>
                    </div>
                  </div>
                </div>

                <!-- Edit Letter Icon -->
                ${selectedLetter.isCustom && html`
                  <button
                    onClick=${() => {
                      soundService.playSparkle();
                      onNavigate('write_letter', selectedLetter.id);
                    }}
                    title="Edit Letter"
                    style=${{
                      position: 'absolute',
                      bottom: '25px',
                      right: '25px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter=${(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave=${(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🖊️
                  </button>
                `}
              </div>
            </div>
          `}

        </div>
      ` : html`
        <!-- Empty Desk State when all letters are deleted -->
        <div className="contributor-no-photos-card empty-desk-card">
          <div className="no-photos-icon">📜</div>
          <h3 className="no-photos-title font-rebecca">No Letters on the Desk</h3>
          <p className="no-photos-desc">
            You've cleared all letters. Share the invite link with friends to collect new heartfelt letters for Vidhanth!
          </p>
          <button
            onClick=${() => {
              soundService.playSparkle();
              onNavigate('write_letter');
            }}
            className="btn btn-gold btn-write-now"
          >
            <span>Write a Letter + 📜</span>
          </button>
        </div>
      `}

      <!-- Bottom Navigation Buttons -->
      <div className="stationery-bottom-nav">
        <button
          onClick=${() => {
            soundService.playClick();
            onNavigate('memories');
          }}
          className="btn btn-secondary"
        >
          <span>← Memories</span>
        </button>

        <button
          onClick=${handleNextPage}
          className="btn btn-gold"
        >
          <span>Blow the Candles →</span>
        </button>
      </div>

      <!-- Delete Confirmation Modal Dialog -->
      ${letterPendingDelete && html`
        <div className="delete-confirm-backdrop" onClick=${() => setLetterPendingDelete(null)}>
          <div className="delete-confirm-modal" onClick=${(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h3 className="delete-modal-title font-rebecca">Delete This Letter?</h3>
            <p className="delete-modal-desc">
              Are you sure you want to remove the letter <strong>"${letterPendingDelete.title || letterPendingDelete.sender || 'Birthday Note'}"</strong> from the reading desk?
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick=${() => {
                  soundService.playClick();
                  setLetterPendingDelete(null);
                }}
                className="btn btn-secondary"
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick=${handleConfirmDelete}
                className="btn btn-danger-delete"
              >
                <span>Yes, Delete Letter</span>
              </button>
            </div>
          </div>
        </div>
      `}

      <!-- Interactive Share with Friends Modal -->
      <${ShareModal}
        isOpen=${isShareModalOpen}
        onClose=${() => setIsShareModalOpen(false)}
        onNavigate=${onNavigate}
      />

      <!-- Attached Memory Lightbox Modal on Letter Desk -->
      ${activeMediaPreview && html`
        <div
          className="polaroid-lightbox-backdrop"
          onClick=${() => setActiveMediaPreview(null)}
        >
          <div
            className="polaroid-lightbox-card"
            onClick=${(e) => e.stopPropagation()}
          >
            <div className="polaroid-washi-tape"></div>

            <div className="polaroid-lightbox-controls">
              <span className="font-rebecca" style=${{ color: '#8a624a', fontSize: '1.05rem' }}>
                ${activeMediaPreview.type === 'video' ? '🎬 Attached Video' : '📷 Attached Photo'}
              </span>
              <button
                className="polaroid-lightbox-close"
                onClick=${() => setActiveMediaPreview(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="polaroid-lightbox-photo">
              ${activeMediaPreview.type === 'video' ? html`
                <video
                  src=${activeMediaPreview.url}
                  controls
                  playsInline
                  className="polaroid-lightbox-video-player"
                ></video>
              ` : html`
                <img
                  src=${activeMediaPreview.url}
                  alt="Attached Memory"
                />
              `}
            </div>

            ${activeMediaPreview.caption && html`
              <div className="polaroid-lightbox-caption font-rebecca">
                "${activeMediaPreview.caption}"
              </div>
            `}
          </div>
        </div>
      `}

      <!-- Floating Write a Letter Button -->
      <button
        onClick=${() => {
          soundService.playSparkle();
          onNavigate('write_letter');
        }}
        title="Write a Letter"
        style=${{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#c19b6c', /* gold accent */
          color: '#fff',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}
      >
        + 📜
      </button>

    </section>
  `;
};
