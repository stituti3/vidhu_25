import { BIRTHDAY_CONFIG } from '../data/birthdayData.js';
import { soundService } from '../services/soundEngine.js';
import { launchConfetti } from '../components/ConfettiLauncher.js';
import { Modal } from '../components/Modal.js';

const { useState } = window.React;
const html = window.htm.bind(window.React.createElement);

export const WishWallPage = ({ onNavigate }) => {
  const [wishes, setWishes] = useState(BIRTHDAY_CONFIG.initialWishes);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form fields
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState('amber');
  const [avatar, setAvatar] = useState('🌸');

  const avatarOptions = ['🌸', '🧵', '✂️', '👗', '✨', '☕', '👑', '🎉', '🥐', '💫'];
  const colorOptions = [
    { id: 'amber', label: 'Linen Gold', hex: '#d97706' },
    { id: 'purple', label: 'Silk Lavender', hex: '#9333ea' },
    { id: 'pink', label: 'Blush Rose', hex: '#db2777' },
    { id: 'cyan', label: 'Atelier Teal', hex: '#0891b2' }
  ];

  const handleAddReaction = (wishId, type) => {
    soundService.playSparkle();
    setWishes(wishes.map((w) => {
      if (w.id === wishId) {
        return {
          ...w,
          reactions: {
            ...w.reactions,
            [type]: (w.reactions[type] || 0) + 1
          }
        };
      }
      return w;
    }));
  };

  const handlePostWish = (e) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;

    soundService.playFanfare();
    launchConfetti('stars');

    const newWish = {
      id: `w-${Date.now()}`,
      author: author.trim(),
      avatar: avatar,
      color: color,
      text: text.trim(),
      reactions: { heart: 1, fire: 0, party: 1 },
      timestamp: 'Just now'
    };

    setWishes([newWish, ...wishes]);
    setIsNoteModalOpen(false);
    setAuthor('');
    setText('');
  };

  return html`
    <section>
      <!-- Header -->
      <div style=${{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="badge-tag">
          <span>🧵</span>
          <span>Dear Dewey Community Letterbox</span>
        </div>
        <h1 className="hero-title" style=${{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
          The <span className="gradient-text">Petite Community Inbox</span>
        </h1>
        <p className="hero-subtitle">
          Loving birthday blessings, styling notes, and heartfelt gratitude from the Dear Dewey readership.
        </p>

        <button
          onClick=${() => { soundService.playClick(); setIsNoteModalOpen(true); }}
          className="btn btn-gold"
          style=${{ padding: '14px 28px', fontSize: '1rem', marginTop: '10px' }}
        >
          <span>✍️</span>
          <span>Pin A Letter to Dewey</span>
        </button>
      </div>

      <!-- Wish Sticky Notes Grid -->
      <div className="wishes-grid">
        ${wishes.map((wish) => html`
          <div key=${wish.id} className=${`wish-note ${wish.color}`}>
            <div className="wish-note-pin">📌</div>

            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style=${{ fontSize: '1.4rem' }}>${wish.avatar}</span>
              <div>
                <div style=${{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>${wish.author}</div>
                <div style=${{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>${wish.timestamp}</div>
              </div>
            </div>

            <div className="wish-text">
              "${wish.text}"
            </div>

            <div className="wish-reactions">
              <button
                onClick=${() => handleAddReaction(wish.id, 'heart')}
                className="reaction-badge"
                title="Send Love"
              >
                <span>❤️</span>
                <span>${wish.reactions.heart || 0}</span>
              </button>

              <button
                onClick=${() => handleAddReaction(wish.id, 'fire')}
                className="reaction-badge"
                title="Super Chic!"
              >
                <span>🔥</span>
                <span>${wish.reactions.fire || 0}</span>
              </button>

              <button
                onClick=${() => handleAddReaction(wish.id, 'party')}
                className="reaction-badge"
                title="Celebration Cheer"
              >
                <span>🎉</span>
                <span>${wish.reactions.party || 0}</span>
              </button>
            </div>
          </div>
        `)}
      </div>

      <!-- Pin A Wish Modal -->
      <${Modal}
        isOpen=${isNoteModalOpen}
        onClose=${() => setIsNoteModalOpen(false)}
        title="💌 Pin a Letter to Dear Dewey"
      >
        <form onSubmit=${handlePostWish} style=${{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Your Name / Sign-off
            </label>
            <input
              type="text"
              value=${author}
              onChange=${(e) => setAuthor(e.target.value)}
              placeholder="E.g., Maya (London Atelier) or A Happy Reader"
              required
              style=${{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          <!-- Avatar Picker -->
          <div>
            <label style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Choose An Icon
            </label>
            <div style=${{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              ${avatarOptions.map((av) => html`
                <button
                  type="button"
                  key=${av}
                  onClick=${() => setAvatar(av)}
                  className=${`btn-icon ${avatar === av ? 'btn-gold' : 'btn-secondary'}`}
                  style=${{ width: '38px', height: '38px', fontSize: '1.2rem' }}
                >
                  ${av}
                </button>
              `)}
            </div>
          </div>

          <!-- Color Theme Picker -->
          <div>
            <label style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Note Paper Color
            </label>
            <div style=${{ display: 'flex', gap: '8px' }}>
              ${colorOptions.map((opt) => html`
                <button
                  type="button"
                  key=${opt.id}
                  onClick=${() => setColor(opt.id)}
                  style=${{
                    flex: '1',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: opt.hex,
                    border: color === opt.id ? '2px solid #ffffff' : 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ${opt.label}
                </button>
              `)}
            </div>
          </div>

          <div>
            <label style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Your Letter or Birthday Blessing
            </label>
            <textarea
              value=${text}
              onChange=${(e) => setText(e.target.value)}
              placeholder="Share advice, a styling memory, or the sweetest birthday wish..."
              rows="4"
              required
              style=${{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none',
                resize: 'none'
              }}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-gold" style=${{ padding: '14px', marginTop: '6px' }}>
            <span>📌</span>
            <span>Pin Letter to Community Inbox</span>
          </button>
        </form>
      <//>

      <!-- Footer Navigation -->
      <div style=${{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick=${() => onNavigate('arcade')} className="btn btn-secondary">
          <span>Next: Petite Styling Mini Arcade 🎮 ➔</span>
        </button>
      </div>
    </section>
  `;
};
