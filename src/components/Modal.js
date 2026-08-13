import { soundService } from '../services/soundEngine.js';

const { useEffect } = window.React;
const html = window.htm.bind(window.React.createElement);

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      soundService.playSparkle();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return html`
    <div className="modal-backdrop" onClick=${onClose}>
      <div className="modal-card" onClick=${(e) => e.stopPropagation()}>
        <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          ${title && html`<h3 style=${{ fontSize: '1.4rem' }} className="gradient-text">${title}</h3>`}
          <button
            onClick=${() => {
              soundService.playClick();
              onClose();
            }}
            className="btn btn-secondary btn-icon"
            style=${{ width: '36px', height: '36px', fontSize: '1.2rem', marginLeft: 'auto' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          ${children}
        </div>
      </div>
    </div>
  `;
};
