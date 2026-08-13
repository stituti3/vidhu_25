import { BIRTHDAY_CONFIG } from '../data/birthdayData.js';
import { soundService } from '../services/soundEngine.js';
import { launchConfetti } from '../components/ConfettiLauncher.js';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const SecretGiftPage = ({ onNavigate }) => {
  const { secretLetter, celebrant } = BIRTHDAY_CONFIG;
  const canvasRef = useRef(null);
  const [isScratchComplete, setIsScratchComplete] = useState(false);
  const [isGiftBoxOpen, setIsGiftBoxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scratch');

  useEffect(() => {
    if (activeTab !== 'scratch' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.3, '#fde68a');
    grad.addColorStop(0.5, '#b91c1c');
    grad.addColorStop(0.8, '#fef08a');
    grad.addColorStop(1, '#7f1d1d');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.font = "bold 18px 'Outfit', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SCRATCH TO REVEAL CONFIDENTIAL NOTE ✨', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() < 0.2) {
        soundService.playSparkle();
      }

      checkScratchPercentage();
    };

    const checkScratchPercentage = () => {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const total = imgData.data.length / 4;
        let transparent = 0;

        for (let i = 3; i < imgData.data.length; i += 64) {
          if (imgData.data[i] === 0) transparent++;
        }

        const percent = (transparent / (total / 16)) * 100;
        if (percent > 45 && !isScratchComplete) {
          setIsScratchComplete(true);
          soundService.playFanfare();
          launchConfetti('fireworks');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (e) {}
    };

    const handlePointerDown = (e) => {
      isDrawing = true;
      const r = canvas.getBoundingClientRect();
      scratch(e.clientX - r.left, e.clientY - r.top);
    };

    const handlePointerMove = (e) => {
      if (!isDrawing) return;
      const r = canvas.getBoundingClientRect();
      scratch(e.clientX - r.left, e.clientY - r.top);
    };

    const handlePointerUp = () => {
      isDrawing = false;
    };

    const handleTouchMove = (e) => {
      if (!isDrawing || e.touches.length === 0) return;
      const r = canvas.getBoundingClientRect();
      scratch(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      const r = canvas.getBoundingClientRect();
      scratch(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
    });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [activeTab, isScratchComplete]);

  const handleRevealAll = () => {
    soundService.playFanfare();
    launchConfetti('fireworks');
    setIsScratchComplete(true);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleGiftBoxClick = () => {
    soundService.playSparkle();
    setIsGiftBoxOpen(!isGiftBoxOpen);
    if (!isGiftBoxOpen) {
      setTimeout(() => launchConfetti('stars'), 300);
    }
  };

  return html`
    <section style=${{ textAlign: 'center' }}>
      <!-- Header -->
      <div className="badge-tag">
        <span>📜</span>
        <span>Confidential & Editorial</span>
      </div>

      <h1 className="hero-title" style=${{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
        The <span className="gradient-text">Editor's Note & Surprise</span>
      </h1>

      <p className="hero-subtitle" style=${{ maxWidth: '620px', margin: '0 auto 24px' }}>
        A personal, behind-the-scenes letter from Chamiah to Dewey celebrating friendship, design courage, and Ed. 01.
      </p>

      <!-- Mode Switcher Tabs -->
      <div style=${{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '30px' }}>
        <button
          onClick=${() => { soundService.playClick(); setActiveTab('scratch'); }}
          className=${`nav-item-btn ${activeTab === 'scratch' ? 'active' : ''}`}
          style=${{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          <span>✨</span>
          <span>Wax Foil Scratch Card</span>
        </button>

        <button
          onClick=${() => { soundService.playClick(); setActiveTab('gift'); }}
          className=${`nav-item-btn ${activeTab === 'gift' ? 'active' : ''}`}
          style=${{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          <span>🎀</span>
          <span>Haute Couture Box</span>
        </button>

        <button
          onClick=${() => { soundService.playClick(); setActiveTab('letter'); }}
          className=${`nav-item-btn ${activeTab === 'letter' ? 'active' : ''}`}
          style=${{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          <span>📜</span>
          <span>Full Editorial Letter</span>
        </button>
      </div>

      <!-- Tab 1: Interactive Canvas Scratch Card -->
      ${activeTab === 'scratch' && html`
        <div style=${{ maxWidth: '520px', margin: '0 auto' }}>
          <div className="scratch-container">
            <div className="scratch-hidden-content">
              <div style=${{ fontSize: '2.5rem', marginBottom: '8px' }}>💖</div>
              <h3 style=${{ color: 'var(--accent-gold)', fontSize: '1.4rem', marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>
                To The Extraordinary Dewey
              </h3>
              <p style=${{ color: '#f1f5f9', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '380px' }}>
                "May your life be woven with effortless grace, boundless creative breakthroughs, and a community that cherishes every stitch you make."
              </p>
              <div style=${{ marginTop: '16px', fontSize: '1rem', color: 'var(--accent-gold)', fontFamily: "'Caveat', cursive", fontWeight: '700' }}>
                ~ ${secretLetter.sender}
              </div>
            </div>

            ${!isScratchComplete && html`
              <canvas ref=${canvasRef} className="scratch-canvas"></canvas>
            `}
          </div>

          <div style=${{ marginTop: '14px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ${isScratchComplete ? '🎉 Fully revealed! You are radiant!' : secretLetter.scratchHint}
          </div>

          <div style=${{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            ${!isScratchComplete && html`
              <button onClick=${handleRevealAll} className="btn btn-gold" style=${{ padding: '10px 20px' }}>
                <span>🪄</span>
                <span>Instantly Reveal Letter</span>
              </button>
            `}
          </div>
        </div>
      `}

      <!-- Tab 2: 3D Animated Gift Box -->
      ${activeTab === 'gift' && html`
        <div style=${{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="gift-box-wrapper" onClick=${handleGiftBoxClick}>
            <div className=${`gift-box ${isGiftBoxOpen ? 'opened' : ''}`}>
              <div className="gift-lid">
                <div className="gift-bow">🎀</div>
                <div className="gift-ribbon-v"></div>
              </div>
              <div className="gift-body">
                <div className="gift-ribbon-v"></div>
              </div>
            </div>
          </div>

          <div style=${{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            ${isGiftBoxOpen ? '✨ Box opened!' : '👆 Tap the gift box to untie the velvet ribbon!'}
          </div>

          ${isGiftBoxOpen && html`
            <div className="glass-panel" style=${{ padding: '24px', animation: 'slideUp 0.4s ease' }}>
              <div style=${{ fontSize: '2.5rem', marginBottom: '10px' }}>🧵 👗 ✨</div>
              <h3 className="gradient-text" style=${{ fontSize: '1.4rem', marginBottom: '8px' }}>
                Dewey's VIP Editorial Pass!
              </h3>
              <p style=${{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                This coupon entitles <strong>${celebrant.name}</strong> to:
                <br />
                ☕ 1x Unlimited Atelier Coffee & Croissants
                <br />
                ✂️ 1x Fabric Hunting Spree on Us
                <br />
                💖 Endless Creative Support & Celebration!
              </p>
            </div>
          `}
        </div>
      `}

      <!-- Tab 3: Heartfelt Editorial Letter -->
      ${activeTab === 'letter' && html`
        <div
          className="glass-panel"
          style=${{
            maxWidth: '680px',
            margin: '0 auto',
            padding: '36px 30px',
            textAlign: 'left',
            background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.8), rgba(20, 14, 46, 0.9))',
            border: '1px solid var(--border-card-hover)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style=${{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: '700', letterSpacing: '0.1em' }}>
              📜 ${secretLetter.sealText}
            </div>
            <div style=${{ fontSize: '1.4rem' }}>💌</div>
          </div>

          <div style=${{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.8', color: '#f1f5f9', fontFamily: 'var(--font-body)' }}>
            ${secretLetter.content}
          </div>

          <div style=${{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style=${{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', color: 'var(--accent-gold)' }}>
              ${secretLetter.sender}
            </div>
            <button
              onClick=${() => { soundService.playSparkle(); launchConfetti('stars'); }}
              className="btn btn-gold"
              style=${{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              <span>💖</span>
              <span>Send Big Hug to Chamiah</span>
            </button>
          </div>
        </div>
      `}

      <!-- Footer Navigation -->
      <div style=${{ marginTop: '50px' }}>
        <button onClick=${() => onNavigate('wishes')} className="btn btn-secondary">
          <span>Next: Reader Letterbox & Wishes 🧵 ➔</span>
        </button>
      </div>
    </section>
  `;
};
