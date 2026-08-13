import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786657273';
import { soundService } from '../services/soundEngine.js?v=1786657273';
import { launchConfetti } from '../components/ConfettiLauncher.js?v=1786657273';

const { useState } = window.React;
const html = window.htm.bind(window.React.createElement);

const SketchStrawberry = ({ style }) => html`
  <div style=${{ position: 'absolute', width: '24px', height: '30px', zIndex: 5, ...style }}>
    <svg width="24" height="30" viewBox="0 0 24 30">
      <!-- Body -->
      <path d="M12,28 C2,22 0,10 6,4 C10,0 14,0 18,4 C24,10 22,22 12,28 Z" fill="#d92121" stroke="#a01a1a" strokeWidth="1.5" strokeLinejoin="round" />
      <!-- Seeds -->
      <circle cx="8" cy="10" r="0.8" fill="#fde047" />
      <circle cx="16" cy="10" r="0.8" fill="#fde047" />
      <circle cx="12" cy="15" r="0.8" fill="#fde047" />
      <circle cx="7" cy="18" r="0.8" fill="#fde047" />
      <circle cx="17" cy="18" r="0.8" fill="#fde047" />
      <circle cx="12" cy="22" r="0.8" fill="#fde047" />
      <!-- Leaves -->
      <path d="M12,5 Q8,0 4,2 Q10,6 12,5 Q16,0 20,2 Q14,6 12,5 Z" fill="#228b22" stroke="#166534" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  </div>
`;

export const CakePage = ({ onNavigate }) => {
  const { celebrant, cake } = BIRTHDAY_CONFIG;
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const handleBlowCandles = () => {
    soundService.playBlow();
    setTimeout(() => {
      soundService.playFanfare();
      launchConfetti('fireworks');
    }, 300);
    setCandlesBlown(true);
    setHasCelebrated(true);
  };

  const handleRelight = () => {
    soundService.playSparkle();
    setCandlesBlown(false);
  };

  return html`
    <section className="stationery-content-section cake-section">
      
      <!-- Warm Heartfelt Header -->
      <div className="card-vintage-header warm-polaroid-header">
        <h1 className="hero-title font-rebecca-title warm-heading">
          Make a Wish & Blow the Candles ♡
        </h1>
      </div>

      <!-- Interactive Cake Display -->
      <div className="cake-ceremony-wrapper">
        <div className="cake-stage">
          
          <!-- Cake Container -->
          <div className=${`vintage-cake-art ${candlesBlown ? 'blown-out' : 'lit'}`}>
            
            <!-- Number 25 Birthday Candles -->
            <div className="cake-number-candles-row">
              <!-- Candle 2 -->
              <div className="cake-number-candle">
                <div className=${`candle-flame ${candlesBlown ? 'extinguished' : ''}`}></div>
                <div className="candle-wick"></div>
                <div className="candle-number-body">
                  <span className="candle-digit">2</span>
                </div>
                <div className="candle-pick"></div>
              </div>

              <!-- Candle 5 -->
              <div className="cake-number-candle">
                <div className=${`candle-flame ${candlesBlown ? 'extinguished' : ''}`}></div>
                <div className="candle-wick"></div>
                <div className="candle-number-body">
                  <span className="candle-digit">5</span>
                </div>
                <div className="candle-pick"></div>
              </div>
            </div>

            <!-- Cake Layers (Cream with Red Bows & Piping) -->
            <div className="cake-tier-top">
              <div className="cake-piping-top"></div>
              
              <div className="cake-swag" style=${{ left: '10%', width: '26%', top: '15px' }}></div>
              <div className="cake-swag" style=${{ left: '36%', width: '28%', top: '18px' }}></div>
              <div className="cake-swag" style=${{ left: '64%', width: '26%', top: '15px' }}></div>
              
              <${SketchStrawberry} style=${{ top: '-15px', left: '10px', transform: 'rotate(-10deg)' }} />
              <${SketchStrawberry} style=${{ top: '-10px', left: '60px', transform: 'rotate(5deg)' }} />
              <${SketchStrawberry} style=${{ top: '-10px', left: '110px', transform: 'rotate(-5deg)' }} />
              <${SketchStrawberry} style=${{ top: '-15px', left: '160px', transform: 'rotate(15deg)' }} />
              
              <div className="cake-piping-bottom"></div>
            </div>
            
            <div className="cake-tier-bottom">
              <div className="cake-piping-top"></div>
              
              <div className="cake-swag" style=${{ left: '12%', width: '38%', top: '20px' }}></div>
              <div className="cake-swag" style=${{ left: '50%', width: '38%', top: '20px' }}></div>
              
              <${SketchStrawberry} style=${{ top: '-18px', left: '15px', transform: 'rotate(-8deg)' }} />
              <${SketchStrawberry} style=${{ top: '-12px', left: '110px', transform: 'rotate(4deg)' }} />
              <${SketchStrawberry} style=${{ top: '-18px', left: '205px', transform: 'rotate(12deg)' }} />
              
              <div className="cake-piping-bottom"></div>
            </div>
            <div className="cake-plate"></div>
          </div>

          <!-- Wish Controls Panel -->
          <div className="cake-controls-panel">
            ${!candlesBlown ? html`
              <button
                onClick=${handleBlowCandles}
                className="btn btn-gold btn-blow-candles"
              >
                <span>Blow Out the Candles 🕯️</span>
              </button>
            ` : html`
              <div className="wish-granted-banner">
                <h2 className="wish-success-title font-rebecca">Happy 25th birthday ♡</h2>
                <p className="wish-success-text">
                  You are more loved everyday. You are more awesome than you think. Hope this year brings you everything you deserve and more!! ♡
                </p>
                <div className="cake-action-buttons">
                  <button
                    onClick=${() => {
                      soundService.playFanfare();
                    }}
                    className="btn btn-gold"
                  >
                    <span>Celebrate Again ✦</span>
                  </button>
                  <button
                    onClick=${handleRelight}
                    className="btn btn-secondary"
                  >
                    <span>Relight Candles</span>
                  </button>
                </div>
              </div>
            `}
          </div>

        </div>
      </div>

      <!-- Bottom Navigation Actions -->
      <div className="stationery-bottom-nav">
        <button
          onClick=${() => {
            soundService.playClick();
            onNavigate('letters');
          }}
          className="btn btn-secondary"
        >
          <span>← Letters</span>
        </button>

        <button
          onClick=${() => {
            soundService.playClick();
            onNavigate('balloons');
          }}
          className="btn btn-gold"
        >
          <span>Your Flower Bouquet →</span>
        </button>
      </div>
    </section>
  `;
};
