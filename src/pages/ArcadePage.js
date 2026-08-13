import { soundService } from '../services/soundEngine.js';
import { launchConfetti } from '../components/ConfettiLauncher.js';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const ArcadePage = ({ onNavigate }) => {
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [targets, setTargets] = useState([]);
  const timerRef = useRef(null);
  const spawnerRef = useRef(null);

  const icons = ['🧵', '✂️', '👗', '🎈', '🍾', '🍓', '✨', '👑', '🥐'];

  const startGame = () => {
    soundService.playFanfare();
    launchConfetti('stars');
    setGameState('playing');
    setScore(0);
    setTimeLeft(25);
    setTargets([]);

    clearInterval(timerRef.current);
    clearInterval(spawnerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnerRef.current = setInterval(() => {
      spawnTarget();
    }, 650);
  };

  const spawnTarget = () => {
    const id = `t-${Date.now()}-${Math.random()}`;
    const x = Math.random() * 80 + 10;
    const speed = Math.random() * 3 + 3.5;
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const points = icon === '👑' || icon === '👗' ? 3 : 1;

    setTargets((prev) => [
      ...prev.slice(-12),
      { id, x, y: 100, speed, icon, points }
    ]);
  };

  const popTarget = (id, points) => {
    soundService.playSparkle();
    setScore((prev) => {
      const nextScore = prev + points;
      if (nextScore > highScore) setHighScore(nextScore);
      return nextScore;
    });

    setTargets((prev) => prev.filter((t) => t.id !== id));

    if (score > 0 && score % 10 === 0) {
      launchConfetti('standard');
    }
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    clearInterval(spawnerRef.current);
    setGameState('gameover');
    soundService.playFanfare();
    launchConfetti('fireworks');
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnerRef.current);
    };
  }, []);

  return html`
    <section style=${{ textAlign: 'center' }}>
      <!-- Header -->
      <div className="badge-tag">
        <span>🎮</span>
        <span>Petite Studio Mini Arcade</span>
      </div>

      <h1 className="hero-title" style=${{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
        Fabric & Bubble <span className="gradient-text">Frenzy</span>
      </h1>

      <p className="hero-subtitle">
        Pop rising fabric spools, champagne bubbles, and styling crowns before the clock runs out!
      </p>

      <!-- Scoreboard -->
      <div style=${{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '24px' }}>
        <div className="glass-panel" style=${{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}>
          <span style=${{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score: </span>
          <strong style=${{ fontSize: '1.3rem', color: 'var(--accent-gold)' }}>${score}</strong>
        </div>

        <div className="glass-panel" style=${{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}>
          <span style=${{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Time: </span>
          <strong style=${{ fontSize: '1.3rem', color: timeLeft <= 5 ? '#ef4444' : '#ffffff' }}>${timeLeft}s</strong>
        </div>

        <div className="glass-panel" style=${{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}>
          <span style=${{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Best: </span>
          <strong style=${{ fontSize: '1.3rem', color: '#a855f7' }}>${highScore}</strong>
        </div>
      </div>

      <!-- Arcade Arena -->
      <div className="arcade-arena">
        ${gameState === 'idle' && html`
          <div style=${{ textAlign: 'center', zIndex: 10 }}>
            <div style=${{ fontSize: '4rem', marginBottom: '14px', animation: 'bounce 2s infinite' }}>🧵 ✨ 👗</div>
            <h3 style=${{ fontSize: '1.6rem', marginBottom: '8px' }}>Ready to Test Your Reflexes?</h3>
            <p style=${{ color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 24px' }}>
              Golden crowns (👑) & designer dresses (👗) give <strong>+3 points</strong>! Standard spools & bubbles give +1!
            </p>
            <button onClick=${startGame} className="btn btn-gold" style=${{ padding: '16px 36px', fontSize: '1.15rem' }}>
              <span>🚀</span>
              <span>Start Arcade Rush</span>
            </button>
          </div>
        `}

        ${gameState === 'playing' && html`
          <div>
            ${targets.map((t) => html`
              <div
                key=${t.id}
                className="balloon-target"
                style=${{
                  left: `${t.x}%`,
                  bottom: `${t.y}%`,
                  animationDuration: `${t.speed}s`
                }}
                onClick=${() => popTarget(t.id, t.points)}
              >
                ${t.icon}
              </div>
            `)}
          </div>
        `}

        ${gameState === 'gameover' && html`
          <div style=${{ textAlign: 'center', zIndex: 10, animation: 'slideUp 0.4s ease' }}>
            <div style=${{ fontSize: '3.5rem', marginBottom: '10px' }}>🏆</div>
            <h3 className="gradient-text" style=${{ fontSize: '1.8rem', marginBottom: '6px' }}>
              Game Over! Outstanding Run!
            </h3>
            <p style=${{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '16px' }}>
              You scored <strong style=${{ color: 'var(--accent-gold)' }}>${score} points</strong>!
            </p>
            <div className="glass-panel" style=${{ padding: '16px', maxWidth: '380px', margin: '0 auto 24px' }}>
              <p style=${{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                ${score >= 20 ? '🎉 Trophy Awarded: Dear Dewey VIP Haute Patron!' : '✨ Splendid effort! Can you beat 20 points?'}
              </p>
            </div>
            <button onClick=${startGame} className="btn btn-gold" style=${{ padding: '14px 32px' }}>
              <span>🔄</span>
              <span>Play Again</span>
            </button>
          </div>
        `}
      </div>

      <!-- Navigation Shortcut -->
      <div style=${{ marginTop: '40px' }}>
        <button onClick=${() => onNavigate('landing')} className="btn btn-secondary">
          <span>Back to Issue Cover 💌 ➔</span>
        </button>
      </div>
    </section>
  `;
};
