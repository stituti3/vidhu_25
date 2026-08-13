import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786659469';
import { soundService } from '../services/soundEngine.js?v=1786659469';
import { launchConfetti } from '../components/ConfettiLauncher.js?v=1786659469';

const { useState } = window.React;
const html = window.htm.bind(window.React.createElement);

export const LandingPage = ({ onNavigate }) => {
  const { celebrant } = BIRTHDAY_CONFIG;
  const [isOpening, setIsOpening] = useState(false);

  const handleWaxSealClick = (e) => {
    e.stopPropagation();
    if (isOpening) return;

    setIsOpening(true);

    // Smoothly transition to Page 2 (Memories) after envelope unfolds
    setTimeout(() => {
      onNavigate('memories');
    }, 1000);
  };

  return html`
    <div className="envelope-viewport-container">
      <!-- Full-Page / Fit-to-Page Realistic Cream Linen Envelope -->
      <div className=${`realistic-envelope-canvas ${isOpening ? 'opened' : ''}`}>
        
        <!-- Base Paper Envelope Texture & Side/Bottom Folds -->
        <div className="envelope-paper-base">
          <!-- Subtle Paper Grain Overlay -->
          <div className="paper-grain-texture"></div>

          <!-- Crisp, Realistic Diagonal Fold Seams -->
          <svg className="envelope-seams-svg" viewBox="0 0 800 540" preserveAspectRatio="none">
            <defs>
              <filter id="fold-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.12" />
              </filter>
              <linearGradient id="left-flap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#faf5ec" />
                <stop offset="100%" stop-color="#ede4d4" />
              </linearGradient>
              <linearGradient id="right-flap-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f8f2e7" />
                <stop offset="100%" stop-color="#eae0cf" />
              </linearGradient>
              <linearGradient id="bottom-flap-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#fdf9f2" />
                <stop offset="100%" stop-color="#e8decb" />
              </linearGradient>
            </defs>

            <!-- Bottom triangular flap -->
            <polygon points="0,540 800,540 400,285" fill="url(#bottom-flap-grad)" filter="url(#fold-shadow)" />
            <!-- Bottom crease lines -->
            <line x1="0" y1="540" x2="400" y2="285" stroke="#d5c8b2" stroke-width="1.2" stroke-opacity="0.7" />
            <line x1="800" y1="540" x2="400" y2="285" stroke="#d5c8b2" stroke-width="1.2" stroke-opacity="0.7" />

            <!-- Left triangular flap -->
            <polygon points="0,0 0,540 400,285" fill="url(#left-flap-grad)" />
            <line x1="0" y1="0" x2="400" y2="285" stroke="#d8ccb7" stroke-width="1" stroke-opacity="0.6" />

            <!-- Right triangular flap -->
            <polygon points="800,0 800,540 400,285" fill="url(#right-flap-grad)" />
            <line x1="800" y1="0" x2="400" y2="285" stroke="#d8ccb7" stroke-width="1" stroke-opacity="0.6" />
          </svg>
        </div>

        <!-- 3D Top Triangular Flap -->
        <div className="envelope-top-flap-3d">
          <svg className="top-flap-svg" viewBox="0 0 800 320" preserveAspectRatio="none">
            <defs>
              <filter id="top-flap-drop" x="-10%" y="-10%" width="120%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.2" />
              </filter>
              <linearGradient id="top-flap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fffdf8" />
                <stop offset="70%" stop-color="#f7f1e4" />
                <stop offset="100%" stop-color="#ede3d1" />
              </linearGradient>
            </defs>
            <polygon points="0,0 800,0 400,310" fill="url(#top-flap-grad)" filter="url(#top-flap-drop)" />
            <!-- Delicate diagonal edge highlights -->
            <line x1="0" y1="0" x2="400" y2="310" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8" />
            <line x1="800" y1="0" x2="400" y2="310" stroke="#d8ccb7" stroke-width="1.2" stroke-opacity="0.7" />
          </svg>
        </div>

        <!-- Photorealistic Red Sealing Wax Stamp with Cursive "V" -->
        <div className="wax-seal-anchor">
          <button
            type="button"
            className="photoreal-wax-seal-btn"
            onClick=${handleWaxSealClick}
            title="Click the vintage 'V' wax seal to open"
            aria-label="Open Birthday Envelope"
          >
            <!-- SVG Photorealistic Melted Red Wax Seal with Organic Rim & Glossy Specular Highlights -->
            <svg viewBox="0 0 160 160" className="wax-seal-svg" width="100%" height="100%">
              <defs>
                <!-- Wax Drop Shadow -->
                <filter id="wax-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                  <feOffset dx="0" dy="7" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.45" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <!-- Deep Ruby Scarlet Wax Radial Gradient -->
                <radialGradient id="wax-body-grad" cx="38%" cy="34%" r="65%">
                  <stop offset="0%" stop-color="#f87171" />
                  <stop offset="25%" stop-color="#ef4444" />
                  <stop offset="55%" stop-color="#dc2626" />
                  <stop offset="80%" stop-color="#b91c1c" />
                  <stop offset="100%" stop-color="#7f1d1d" />
                </radialGradient>

                <!-- Recessed Inner Ring Gradient -->
                <radialGradient id="wax-inner-grad" cx="35%" cy="30%" r="60%">
                  <stop offset="0%" stop-color="#ef4444" />
                  <stop offset="60%" stop-color="#b91c1c" />
                  <stop offset="100%" stop-color="#6b1111" />
                </radialGradient>

                <!-- Specular Gloss Highlight -->
                <linearGradient id="gloss-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                  <stop offset="60%" stop-color="#ffffff" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- Outer Organic Melted Wax Puddle Shape -->
              <path
                d="M 80,12 
                   C 105,11 130,22 142,42 
                   C 154,62 153,92 143,115 
                   C 133,138 108,151 82,150 
                   C 56,149 31,139 19,118 
                   C 7,97 10,66 22,43 
                   C 34,20 55,13 80,12 Z"
                fill="url(#wax-body-grad)"
                filter="url(#wax-shadow)"
              />

              <!-- Outer Lip Bevel Highlight & Shading -->
              <path
                d="M 80,16 
                   C 102,15 125,25 136,44 
                   C 147,63 146,89 137,110 
                   C 128,131 106,143 82,142 
                   C 58,141 36,132 25,113 
                   C 14,94 17,67 27,45 
                   C 37,23 58,17 80,16 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                stroke-width="3"
              />

              <!-- Inner Recessed Stamp Basin -->
              <circle
                cx="80"
                cy="80"
                r="46"
                fill="url(#wax-inner-grad)"
                stroke="#6b1111"
                stroke-width="2.5"
              />

              <!-- Inner Embossed Circular Ridge -->
              <circle
                cx="80"
                cy="80"
                r="44"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                stroke-width="1.8"
              />

              <!-- Vintage Cursive Embossed Letter 'V' -->
              <text
                x="70"
                y="100"
                text-anchor="middle"
                font-family="'Pinyon Script', 'Great Vibes', cursive"
                font-size="64"
                font-weight="bold"
                fill="#fef08a"
                style=${{
                  filter: 'drop-shadow(0 2px 3px rgba(74, 4, 4, 0.95)) drop-shadow(0 -1px 1px rgba(255, 255, 255, 0.6))',
                  userSelect: 'none',
                }}
              >
                ${celebrant.waxSealInitial || 'V'}
              </text>

              <!-- Curved Specular Gloss Reflections (Toned down) -->
              <path
                d="M 44,36 C 62,23 98,23 116,36 C 110,41 96,35 80,35 C 64,35 50,41 44,36 Z"
                fill="url(#gloss-grad)"
                opacity="0.55"
              />
              <ellipse cx="48" cy="48" rx="8" ry="4" transform="rotate(-30 48 48)" fill="#ffffff" opacity="0.35" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  `;
};
