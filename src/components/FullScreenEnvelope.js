import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786660166';

const { useState } = window.React;
const html = window.htm.bind(window.React.createElement);

export function FullScreenEnvelope({
  isOpen,
  onOpen,
  activePage,
  onNavigate,
  isContributorMode = false,
  hasSubmittedLetter = false,
  children
}) {
  const { celebrant } = BIRTHDAY_CONFIG;

  const handleSealClick = (e) => {
    e.stopPropagation();
    if (isOpen) return;

    if (onOpen) onOpen();
  };

  const getTooltipText = () => {
    if (isContributorMode) {
      return hasSubmittedLetter ? 'Tap to view your letter ♡' : 'Tap to write your letter ♡';
    }
    return 'Tap to open ♡';
  };

  return html`
    <div className=${`fullscreen-envelope-wrapper envelope ${isOpen ? 'envelope-is-open' : 'envelope-is-closed'}`}>
      
      <!-- Envelope Exterior Pocket Backing (Open State) -->
      <div className="env-outer-pocket">
        <div className="env-pocket-left"></div>
        <div className="env-pocket-right"></div>
        <div className="env-pocket-bottom"></div>
      </div>

      <!-- Closed Flaps for Page 1 (Aged Paper Texture with feTurbulence Blotches & Fine Grain) -->
      ${!isOpen && html`
        <div className="env-closed-layer envelope">
          
          <!-- Contributor Mode Warm Badge if applicable -->
          ${isContributorMode && html`
            <div className="contributor-envelope-tag font-rebecca">
              ${hasSubmittedLetter ? `Your Letter to ${celebrant.nickname || celebrant.name} is Sealed 💌` : `Write a Birthday Letter for ${celebrant.nickname || celebrant.name} ♡`}
            </div>
          `}

          <!-- Realistic Diagonal Fold Seams & Overlapping Flaps -->
          <svg className="envelope-creases-svg" viewBox="0 0 1000 650" preserveAspectRatio="none">
            <defs>
              <!-- Flap Drop Shadow -->
              <filter id="crease-depth-shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="4.5" stdDeviation="4.5" flood-color="#3d2c1c" flood-opacity="0.25" />
              </filter>
              
              <!-- Aged Warm Off-White Gradients Matching Reference -->
              <linearGradient id="top-flap-parchment" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e8e2d8" />
                <stop offset="50%" stop-color="#ddd5c7" />
                <stop offset="100%" stop-color="#e5ded2" />
              </linearGradient>

              <linearGradient id="bottom-flap-parchment" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#e5ded2" />
                <stop offset="50%" stop-color="#ddd5c7" />
                <stop offset="100%" stop-color="#d6cdbe" />
              </linearGradient>

              <linearGradient id="left-flap-parchment" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stop-color="#e2dbcf" />
                <stop offset="100%" stop-color="#d6cdbe" />
              </linearGradient>

              <linearGradient id="right-flap-parchment" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stop-color="#e2dbcf" />
                <stop offset="100%" stop-color="#d6cdbe" />
              </linearGradient>
            </defs>

            <!-- Bottom Flap -->
            <polygon points="0,650 1000,650 500,325" fill="url(#bottom-flap-parchment)" />
            <!-- Left Flap -->
            <polygon points="0,0 0,650 500,325" fill="url(#left-flap-parchment)" />
            <!-- Right Flap -->
            <polygon points="1000,0 1000,650 500,325" fill="url(#right-flap-parchment)" />

            <!-- Crease Seam Lines (Left & Right to Center) -->
            <line x1="0" y1="650" x2="500" y2="325" stroke="#b3a592" stroke-width="1.4" />
            <line x1="0" y1="650" x2="500" y2="325" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.65" />
            <line x1="1000" y1="650" x2="500" y2="325" stroke="#b3a592" stroke-width="1.4" />
            <line x1="1000" y1="650" x2="500" y2="325" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.65" />

            <!-- Top Flap Overlapping with Real Paper Shadow -->
            <polygon points="0,0 1000,0 500,325" fill="url(#top-flap-parchment)" filter="url(#crease-depth-shadow)" />
            <!-- Top Flap Edge Crisp Seams -->
            <line x1="0" y1="0" x2="500" y2="325" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.75" />
            <line x1="0" y1="0" x2="500" y2="325" stroke="#aba08f" stroke-width="0.9" />
            <line x1="1000" y1="0" x2="500" y2="325" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.75" />
            <line x1="1000" y1="0" x2="500" y2="325" stroke="#aba08f" stroke-width="0.9" />
          </svg>

          <!-- Centered Real Melted Wax Seal with Rebecca Font 'V' -->
          <div className="env-wax-seal-wrapper">
            <button
              type="button"
              className="wax-seal env-center-wax-seal"
              onClick=${handleSealClick}
              aria-label="Open Birthday Envelope"
            >
              <!-- Recessed Inner Stamped Wax Disc -->
              <div className="wax-seal-inner-disc">
                <svg viewBox="0 0 100 100" className="wax-seal-icon wax-emblem-v">
                  <!-- 1. Shadow / Carved Layer (Offset by 1.5px) in Rebecca Font -->
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

                  <!-- 2. Main Calligraphic 'V' Layer (In Wax Seal Burgundy Tone) -->
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
            </button>

            <!-- Centered Non-Clipping Floating Tooltip -->
            <div className="wax-seal-tooltip" role="tooltip">
              ${getTooltipText()}
            </div>
          </div>
        </div>
      `}

      <!-- Top Flap OPEN at the top of the screen -->
      ${isOpen && html`
        <div className="env-open-top-header">
          <div className="env-open-flap-triangle"></div>
          <div className="env-top-wax-seal-badge wax-seal" onClick=${() => onNavigate('landing')} title="Click to close envelope">
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
      `}

      <!-- The Inner Stationery Paper Card (Now The Textured Wax Seal Maroon Wall with feTurbulence Grain) -->
      ${isOpen && html`
        <div className="env-letter-card-container">
          <div className="env-stationery-card env-maroon-wall envelope">
            <!-- Subtle Gold Accent Inset Border (No Emojis) -->
            <div className="stationery-inner-border maroon-wall-inner">
              
              <!-- Main Dynamic Content (Polaroid Wall / Letters / Cake / Writer) -->
              <div className="stationery-scroll-body">
                ${children}
              </div>
            </div>
          </div>
        </div>
      `}

    </div>
  `;
}
