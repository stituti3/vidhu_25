import { BIRTHDAY_CONFIG } from '../data/birthdayData.js?v=1786657708';
import { soundService } from '../services/soundEngine.js?v=1786657708';
import { launchConfetti } from '../components/ConfettiLauncher.js?v=1786657708';
import { ShareModal } from '../components/ShareModal.js?v=1786657708';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

// Detailed SVG Rose Illustrations (Velvet Red & Creamy White)
const RedRoseIcon = () => html`
  <svg className="rose-svg-icon red-rose-svg" viewBox="0 0 40 40" width="36" height="36">
    <defs>
      <radialGradient id="redRoseGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="50%" stop-color="#b91c1c" />
        <stop offset="100%" stop-color="#7f1d1d" />
      </radialGradient>
      <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
    </defs>
    <!-- Leaves / Calyx -->
    <path d="M14 26 C10 28, 6 25, 8 21 C11 22, 13 24, 14 26 Z" fill="url(#stemGrad)" />
    <path d="M26 26 C30 28, 34 25, 32 21 C29 22, 27 24, 26 26 Z" fill="url(#stemGrad)" />
    <path d="M19 28 Q20 38 21 39 Q19 38 19 28" stroke="#15803d" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <!-- Outer Petals -->
    <path d="M20 7 C27 7, 33 13, 31 20 C29 26, 23 28, 20 28 C17 28, 11 26, 9 20 C7 13, 13 7, 20 7 Z" fill="url(#redRoseGrad)" />
    <!-- Mid Petals Layer -->
    <path d="M20 10 C24 10, 28 14, 27 19 C25 24, 21 25, 20 25 C19 25, 15 24, 13 19 C12 14, 16 10, 20 10 Z" fill="#991b1b" />
    <!-- Petal Highlights -->
    <path d="M16 13 Q20 9 24 13 Q27 18 20 22 Q13 18 16 13" fill="#dc2626" />
    <path d="M18 14 Q20 12 22 14 Q24 17 20 19 Q16 17 18 14" fill="#f87171" />
    <!-- Center Spiral Bud -->
    <circle cx="20" cy="16" r="3" fill="#7f1d1d" />
    <path d="M19 15 Q20 14 21 15 Q21 17 19 17" stroke="#fecaca" stroke-width="1" fill="none" stroke-linecap="round" />
  </svg>
`;

const WhiteRoseIcon = () => html`
  <svg className="rose-svg-icon white-rose-svg" viewBox="0 0 40 40" width="36" height="36">
    <defs>
      <radialGradient id="whiteRoseGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#faf5ec" />
        <stop offset="100%" stop-color="#e2d4be" />
      </radialGradient>
      <linearGradient id="whiteStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#86efac" />
        <stop offset="100%" stop-color="#166534" />
      </linearGradient>
    </defs>
    <!-- Leaves / Calyx -->
    <path d="M14 26 C10 28, 6 25, 8 21 C11 22, 13 24, 14 26 Z" fill="url(#whiteStemGrad)" />
    <path d="M26 26 C30 28, 34 25, 32 21 C29 22, 27 24, 26 26 Z" fill="url(#whiteStemGrad)" />
    <path d="M19 28 Q20 38 21 39 Q19 38 19 28" stroke="#166534" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <!-- Outer Petals -->
    <path d="M20 7 C27 7, 33 13, 31 20 C29 26, 23 28, 20 28 C17 28, 11 26, 9 20 C7 13, 13 7, 20 7 Z" fill="url(#whiteRoseGrad)" stroke="#d5c3aa" stroke-width="0.8" />
    <!-- Mid Petals Layer -->
    <path d="M20 10 C24 10, 28 14, 27 19 C25 24, 21 25, 20 25 C19 25, 15 24, 13 19 C12 14, 16 10, 20 10 Z" fill="#fdfbf7" stroke="#c8b59b" stroke-width="0.6" />
    <!-- Petal Highlights -->
    <path d="M16 13 Q20 9 24 13 Q27 18 20 22 Q13 18 16 13" fill="#ffffff" />
    <path d="M18 14 Q20 12 22 14 Q24 17 20 19 Q16 17 18 14" fill="#faf5ec" stroke="#d5c3aa" stroke-width="0.5" />
    <!-- Center Spiral Bud -->
    <circle cx="20" cy="16" r="3" fill="#d5c3aa" />
    <path d="M19 15 Q20 14 21 15 Q21 17 19 17" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </svg>
`;

export const BalloonGamePage = ({ onNavigate }) => {
  const { celebrant } = BIRTHDAY_CONFIG;
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'completed'
  const [timeLeft, setTimeLeft] = useState(10);
  const [balloons, setBalloons] = useState([]);
  const [poppedPuffs, setPoppedPuffs] = useState([]);
  const [collectedRoses, setCollectedRoses] = useState([]); // array of 'red' | 'white'
  const [redCount, setRedCount] = useState(0);
  const [whiteCount, setWhiteCount] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const arenaRef = useRef(null);
  const balloonIdCounter = useRef(1);
  const spawnTimerRef = useRef(null);
  const animFrameRef = useRef(null);
  const endTimeRef = useRef(null);

  // Start a new 20-second round
  const handleStartGame = () => {
    soundService.playSparkle();
    setBalloons([]);
    setPoppedPuffs([]);
    setCollectedRoses([]);
    setRedCount(0);
    setWhiteCount(0);
    setTimeLeft(10);
    setGameState('playing');
  };

  // 10-second round countdown timer (precise real-time)
  useEffect(() => {
    if (gameState !== 'playing') return;

    endTimeRef.current = Date.now() + 10000; // 10 seconds from now
    setTimeLeft(10);

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        handleGameOver();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleGameOver = () => {
    setGameState('completed');
    setBalloons([]);
    soundService.playFanfare();
    launchConfetti('fireworks');
  };

  // Balloon Spawner Loop during 'playing' state
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnBalloon = () => {
      if (!arenaRef.current) return;
      const arenaWidth = arenaRef.current.clientWidth || 600;
      
      // Random horizontal position within arena bounds
      const minX = 40;
      const maxX = Math.max(minX + 50, arenaWidth - 90);
      const xPos = Math.random() * (maxX - minX) + minX;

      // Float duration between 3.8s and 5.5s
      const duration = 3.8 + Math.random() * 1.7;
      // Slight horizontal sway offset (-35px to +35px)
      const swayOffset = (Math.random() - 0.5) * 70;
      // Alternate flower type (red / white)
      const flowerType = balloonIdCounter.current % 2 === 0 ? 'white' : 'red';
      // Scale variation (0.9 to 1.15)
      const scale = 0.9 + Math.random() * 0.25;

      const newBalloon = {
        id: `b-${balloonIdCounter.current++}`,
        x: xPos,
        y: 105, // start slightly below the bottom (in %)
        swayOffset,
        duration,
        flowerType,
        scale,
        createdAt: Date.now(),
      };

      setBalloons((prev) => [...prev.slice(-10), newBalloon]);
    };

    // Initial burst of 3 balloons
    spawnBalloon();
    setTimeout(spawnBalloon, 350);
    setTimeout(spawnBalloon, 700);

    // Continuous spawn interval (~600ms)
    spawnTimerRef.current = setInterval(spawnBalloon, 620);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameState]);

  // Clean up off-screen balloons periodically
  useEffect(() => {
    if (gameState !== 'playing') return;
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setBalloons((prev) => prev.filter((b) => now - b.createdAt < (b.duration + 0.5) * 1000));
    }, 1000);
    return () => clearInterval(cleanupInterval);
  }, [gameState]);

  // Handle clicking / popping a balloon
  const handlePopBalloon = (e, balloon) => {
    e.stopPropagation();
    soundService.playPop();
    soundService.playSparkle();

    // Get click position relative to arena
    const arenaRect = arenaRef.current ? arenaRef.current.getBoundingClientRect() : { left: 0, top: 0 };
    const clickX = e.clientX - arenaRect.left;
    const clickY = e.clientY - arenaRect.top;

    // Create pop effect & floating rose reward
    const puffId = `puff-${Date.now()}-${Math.random()}`;
    const newPuff = {
      id: puffId,
      x: clickX,
      y: clickY,
      flowerType: balloon.flowerType,
    };

    setPoppedPuffs((prev) => [...prev, newPuff]);
    setTimeout(() => {
      setPoppedPuffs((prev) => prev.filter((p) => p.id !== puffId));
    }, 1100);

    // Remove popped balloon
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    // Update rose collection counters
    if (balloon.flowerType === 'red') {
      setRedCount((c) => c + 1);
    } else {
      setWhiteCount((c) => c + 1);
    }
    setCollectedRoses((prev) => [...prev, balloon.flowerType]);
  };

  const totalRoses = redCount + whiteCount;

  return html`
    <section className="stationery-content-section balloon-game-section">
      
      <!-- Warm Heartfelt Header -->
      <div className="card-vintage-header warm-polaroid-header">
        <h1 className="hero-title font-handwriting warm-heading">
          DIY Bouquet
        </h1>
      </div>

      <!-- Interactive Balloon Flight Arena -->
      <div className="balloon-arena-wrapper">
        <div className="balloon-game-arena" ref=${arenaRef}>
          
          <!-- IDLE WELCOME OVERLAY -->
          ${gameState === 'idle' && html`
            <div className="balloon-start-modal">
              <div className="balloon-modal-parchment">
                <div className="balloon-modal-icon">🎈 🌹 🤍</div>
                <h2 className="balloon-modal-title font-rebecca">Pick Roses for Vidhanth</h2>
                <p className="balloon-modal-desc">
                  Pop the creamy beige balloons floating into the screen to gather fresh red and white roses for your birthday bouquet!
                </p>
                <button
                  onClick=${handleStartGame}
                  className="btn btn-gold btn-start-game"
                >
                  <span>Start Game</span>
                </button>
              </div>
            </div>
          `}

          <!-- ACTIVE FLYING BALLOONS -->
          ${gameState === 'playing' && balloons.map((b) => html`
            <div
              key=${b.id}
              className="creamy-flying-balloon"
              style=${{
                left: `${b.x}px`,
                animationDuration: `${b.duration}s`,
                '--sway-x': `${b.swayOffset}px`,
                transform: `scale(${b.scale})`,
              }}
              onClick=${(e) => handlePopBalloon(e, b)}
            >
              <!-- Balloon Satin Body (Creamy Beige) -->
              <div className="balloon-satin-body">
                <div className="balloon-specular-sheen"></div>
                <div className="balloon-inner-flower-hint">
                  ${b.flowerType === 'red' ? '🌹' : '🤍'}
                </div>
              </div>
              <!-- Balloon Knot -->
              <div className="balloon-bottom-knot"></div>
              <!-- Dangling Ribbon String -->
              <div className="balloon-ribbon-string"></div>
            </div>
          `)}

          <!-- POPPING PARTICLES & FLOATING FLOWER REWARDS -->
          ${poppedPuffs.map((puff) => html`
            <div
              key=${puff.id}
              className="balloon-pop-reward-item"
              style=${{ left: `${puff.x}px`, top: `${puff.y}px` }}
            >
              <!-- Confetti Burst Dot Particles -->
              <div className="pop-particles-burst">
                <span className="burst-dot d1"></span>
                <span className="burst-dot d2"></span>
                <span className="burst-dot d3"></span>
                <span className="burst-dot d4"></span>
                <span className="burst-dot d5"></span>
                <span className="burst-dot d6"></span>
              </div>
              <!-- Rising Rose Reward -->
              <div className="popped-rose-floater">
                ${puff.flowerType === 'red' ? html`<${RedRoseIcon} />` : html`<${WhiteRoseIcon} />`}
                <span className="rose-float-tag">+1 ${puff.flowerType === 'red' ? 'Red' : 'White'} Rose</span>
              </div>
            </div>
          `)}

          <!-- ROUND COMPLETED / GRAND BOUQUET REVEAL MODAL -->
          ${gameState === 'completed' && html`
            <div className="balloon-bouquet-modal">
              <div className="bouquet-reveal-card" style=${{ maxHeight: '95%', overflowY: 'auto', padding: '24px 20px' }}>
                
                <div className="bouquet-card-header" style=${{ marginBottom: '10px' }}>
                  <span className="bouquet-badge font-rebecca">Round Complete ✦</span>
                  <h2 className="bouquet-title font-rebecca">Your Handcrafted Bouquet</h2>
                  <p className="bouquet-subtitle" style=${{ marginBottom: '10px' }}>
                    Gathered with love from ${totalRoses} popped balloons!
                  </p>
                </div>

                <!-- Grand Bouquet Visual Display -->
                <div className="grand-bouquet-display" style=${{ transform: 'scale(0.95)', margin: '0' }}>
                  <div className="bouquet-arrangement-wrapper">
                    <!-- Layered Roses in Bouquet -->
                    <div className="bouquet-roses-cloud">
                      ${collectedRoses.length === 0 ? html`
                        <div className="bouquet-single-rose" style=${{ top: '40px', left: '0', width: '140px', textAlign: 'center' }}>
                          <span style=${{ fontSize: '1rem', color: '#7f1d1d' }}>No roses collected...</span>
                        </div>
                      ` : collectedRoses.map((flowerType, idx) => {
                        const isRed = flowerType === 'red';
                        // Golden angle approximation for natural spiral placement
                        const angle = idx * 137.5 * (Math.PI / 180);
                        const radius = 6.5 * Math.sqrt(idx);
                        
                        // Center is around x:50, y:80 (in a 140x120 box)
                        const cx = 50;
                        const cy = 70;
                        
                        const x = cx + Math.cos(angle) * radius;
                        const y = cy + Math.sin(angle) * (radius * 0.7); // squash y for depth
                        const rot = (x - cx) * 0.9; // angle outward based on x position
                        
                        return html`
                          <div
                            key=${idx}
                            className="bouquet-single-rose"
                            style=${{
                              left: `${x}px`,
                              top: `${y}px`,
                              transform: `rotate(${rot}deg)`,
                              animationDelay: `${idx * 0.04}s`,
                              zIndex: Math.floor(y)
                            }}
                          >
                            ${isRed ? html`<${RedRoseIcon} />` : html`<${WhiteRoseIcon} />`}
                          </div>
                        `;
                      })}
                    </div>

                    <!-- Luxury Kraft Paper Wrap & Satin Bow -->
                    <div className="bouquet-kraft-wrapper">
                      <div className="bouquet-wrap-cone"></div>
                      <div className="bouquet-silk-ribbon">
                        <span className="ribbon-bow">🎀</span>
                        <div className="ribbon-tail left"></div>
                        <div className="ribbon-tail right"></div>
                      </div>
                      <div className="bouquet-tag-label font-rebecca">For Vidhanth ♡</div>
                    </div>
                  </div>
                </div>

                <!-- Bouquet Statistics & Message -->
                <div className="bouquet-stats-box">
                  <div className="bouquet-stat-item">
                    <span className="stat-num text-rose-red">${redCount}</span>
                    <span className="stat-name">Red Roses 🌹</span>
                  </div>
                  <div className="bouquet-stat-divider">+</div>
                  <div className="bouquet-stat-item">
                    <span className="stat-num text-cream-white">${whiteCount}</span>
                    <span className="stat-name">White Roses 🤍</span>
                  </div>
                  <div className="bouquet-stat-divider">=</div>
                  <div className="bouquet-stat-item">
                    <span className="stat-num text-gold-highlight">${totalRoses}</span>
                    <span className="stat-name">Total Roses 💐</span>
                  </div>
                </div>

                <p className="bouquet-sweet-message">
                  "${totalRoses > 0 
                    ? `A bespoke bouquet of ${totalRoses} red & white roses gathered just for you. Happy 25th Birthday, Vidhanth!` 
                    : 'A sweet bouquet of red and white roses for a truly special 25th birthday!'}"
                </p>

                <!-- Actions -->
                <div className="bouquet-action-buttons">
                  <button
                    onClick=${() => {
                      soundService.playSparkle();
                      setIsShareModalOpen(true);
                    }}
                    className="btn btn-gold btn-share-celebrant"
                  >
                    <span>Share Card with Vidhanth 🎁</span>
                  </button>

                  <button
                    onClick=${handleStartGame}
                    className="btn btn-secondary"
                  >
                    <span>Play Another Round ↺</span>
                  </button>
                  <button
                    onClick=${() => {
                      soundService.playClick();
                      onNavigate('landing');
                    }}
                    className="btn btn-secondary"
                  >
                    <span>Back to Envelope ♡</span>
                  </button>
                </div>

              </div>
            </div>
          `}

        </div>
      </div>

      <!-- Game Scoreboard & Live Flower Basket Dock (Visible during play) -->
      ${gameState === 'playing' && html`
        <div className="balloon-scoreboard" style=${{ marginTop: '20px' }}>
          <!-- 10s Round Timer -->
          <div className=${`balloon-stat-pill timer-pill ${timeLeft <= 3 ? 'urgent' : ''}`}>
            <span className="stat-icon">⏱️</span>
            <span className="stat-label">Round:</span>
            <strong className="stat-value">${timeLeft}s</strong>
          </div>

          <!-- Red Roses Counter -->
          <div className="balloon-stat-pill red-rose-pill">
            <span className="stat-icon">🌹</span>
            <span className="stat-label">Red Roses:</span>
            <strong className="stat-value">${redCount}</strong>
          </div>

          <!-- White Roses Counter -->
          <div className="balloon-stat-pill white-rose-pill">
            <span className="stat-icon">🤍</span>
            <span className="stat-label">White Roses:</span>
            <strong className="stat-value">${whiteCount}</strong>
          </div>

          <!-- Total Collected -->
          <div className="balloon-stat-pill total-rose-pill">
            <span className="stat-icon">💐</span>
            <span className="stat-label">Bouquet:</span>
            <strong className="stat-value">${totalRoses}</strong>
          </div>
        </div>
      `}

      <!-- Bottom Navigation Actions -->
      <div className="stationery-bottom-nav">
        <button
          onClick=${() => {
            soundService.playClick();
            onNavigate('cake');
          }}
          className="btn btn-secondary"
        >
          <span>← Back to Cake</span>
        </button>



        <button
          onClick=${() => {
            soundService.playClick();
            onNavigate('landing');
          }}
          className="btn btn-secondary"
        >
          <span>Return to Envelope ♡</span>
        </button>
      </div>

      <!-- Celebration Share Modal for Vidhanth -->
      <${ShareModal}
        isOpen=${isShareModalOpen}
        onClose=${() => setIsShareModalOpen(false)}
        mode="celebrant"
      />

    </section>
  `;
};
