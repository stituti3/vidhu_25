import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786728784';
import { soundService } from '../services/soundEngine.js?v=1786728784';
import { letterStorage } from '../services/letterStorage.js?v=1786728784';
import { launchConfetti } from '../components/ConfettiLauncher.js?v=1786728784';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const WriteLetterPage = ({ onNavigate, initialLetterId, isContributorMode = false }) => {
  const { celebrant } = BIRTHDAY_CONFIG;

  const [viewState, setViewState] = useState(initialLetterId ? 'compose' : 'compose');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  const [savedLetter, setSavedLetter] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Load existing letter if we are editing
  useEffect(() => {
    if (initialLetterId) {
      const allLetters = letterStorage.getMyLetters();
      const existing = allLetters.find(l => l.id === initialLetterId);
      if (existing) {
        setMessage(existing.message || '');
        setSenderName(existing.sender || '');
        setSavedLetter(existing);
      }
    }
  }, [initialLetterId]);

  const resetForm = () => {
    setMessage('');
    setSenderName('');
    setSavedLetter(null);
    setViewState('compose');
    soundService.playClick();
  };

  const handleSaveLetter = (e) => {
    e.preventDefault();
    if (!message.trim() || !senderName.trim()) {
      alert("Please add both your name and a message.");
      return;
    }

    soundService.playSparkle();

    const payload = {
      id: savedLetter ? savedLetter.id : undefined,
      sender: senderName,
      message: message,
    };

    const saved = letterStorage.saveMyLetter(payload);
    
    setSavedLetter(saved);
    setViewState('view');
    setToastMessage('Letter sealed and saved! ✓');
    setTimeout(() => setToastMessage(''), 3500);
  };

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
              Write a Letter to ${celebrant.nickname || celebrant.name} ♡
            </h1>
          </div>

          <form onSubmit=${handleSaveLetter} className="composer-form-parchment torn-paper-composer-card">
            
            <div className="composer-field-group">
              <input
                type="text"
                className="handwritten-letter-textarea font-handwriting"
                placeholder="Your Name"
                style=${{ minHeight: '40px', padding: '10px 15px', marginBottom: '15px' }}
                value=${senderName}
                onChange=${(e) => setSenderName(e.target.value)}
              />
              <textarea
                className="handwritten-letter-textarea"
                placeholder="Write your heartfelt note here..."
                rows="10"
                value=${message}
                onInput=${(e) => setMessage(e.target.value)}
                required
              ></textarea>
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
              onClick=${resetForm}
              className="btn btn-secondary"
            >
              <span>✍️ Write Another Letter</span>
            </button>

            <button
              onClick=${() => {
                soundService.playClick();
                onNavigate(isContributorMode ? 'memories' : 'letters');
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
