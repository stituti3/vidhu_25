import { soundService } from '../services/soundEngine.js?v=1786656180';
import { launchConfetti } from './ConfettiLauncher.js?v=1786656180';

const { useState, useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const Navbar = ({ activePage, setActivePage, currentTheme, setCurrentTheme, isContributorMode = false, hasSubmittedLetter = false }) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [volume, setVolumeState] = useState(25); // 0 - 100% (25% default)
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false);
  const volumeRef = useRef(null);

  const navItems = isContributorMode
    ? [
        { id: 'landing', label: 'Envelope', step: 'I' },
        { id: 'memories', label: 'Polaroid Wall', step: 'II' },
        { id: 'write_letter', label: hasSubmittedLetter ? 'My Letter' : 'Write Letter', step: 'III' }
      ]
    : [
        { id: 'landing', label: 'Envelope', step: 'I' },
        { id: 'memories', label: 'Memories', step: 'II' },
        { id: 'letters', label: 'Letters', step: 'III' },
        { id: 'cake', label: 'Wish & Cake', step: 'IV' },
        { id: 'balloons', label: 'Balloons & Roses', step: 'V' }
      ];

  // Subscribe to audio engine state updates
  useEffect(() => {
    const unsubscribe = soundService.subscribe(({ isPlaying, volume: currentVol }) => {
      setIsPlayingMusic(isPlaying);
      setVolumeState(Math.round(currentVol * 100));
    });
    return unsubscribe;
  }, []);

  // Close volume popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setIsVolumePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageId) => {
    soundService.playClick();
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMusicToggle = () => {
    soundService.playClick();
    soundService.toggleMelody();
  };

  const handleVolumeChange = (newVol) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setVolumeState(clamped);
    soundService.setVolume(clamped / 100);
  };

  const handleVolumePreset = (presetVal) => {
    soundService.playClick();
    handleVolumeChange(presetVal);
  };

  const handleQuickCelebrate = () => {
    soundService.playFanfare();
    launchConfetti('fireworks');
  };

  return html`
    <!-- Vertical Left Sidebar / Dock Menu (Maroon Bar with Beige Buttons & Clean Styling) -->
    <aside className="nav-vertical-sidebar" aria-label="Main Navigation">
      
      <!-- Brand Monogram in Rebecca Font -->
      <div
        className="nav-vertical-brand"
        onClick=${() => handleNavClick('landing')}
        title="Return to Envelope"
      >
        <span className="brand-monogram">V</span>
        <span className="brand-subtext">2026</span>
      </div>

      <!-- Divider -->
      <div className="nav-vertical-divider"></div>

      <!-- Vertical Step Navigation Links (Beige Circles with Burgundy/Gold Numerals) -->
      <nav className="nav-vertical-menu">
        ${navItems.map((item) => html`
          <button
            key=${item.id}
            onClick=${() => handleNavClick(item.id)}
            className=${`nav-vertical-item ${activePage === item.id ? 'active' : ''}`}
            title=${item.label}
          >
            <span className="nav-step-roman">${item.step}</span>
            <span className="nav-step-label">${item.label}</span>
          </button>
        `)}
      </nav>

      <!-- Bottom Divider -->
      <div className="nav-vertical-divider"></div>

      <!-- Action Controls (Speaker Toggle, Volume Slider Button & Confetti) -->
      <div className="nav-vertical-actions">
        
        <!-- 1. Audio Melody Toggle (Plays Original "Love Will Keep Us Alive" by Eagles) -->
        <button
          onClick=${handleMusicToggle}
          className=${`nav-action-btn ${isPlayingMusic ? 'active-audio' : ''}`}
          title=${isPlayingMusic ? 'Pause: Eagles - Love Will Keep Us Alive' : 'Play: Eagles - Love Will Keep Us Alive'}
          aria-label="Toggle Music"
        >
          ${isPlayingMusic
            ? html`
                <!-- Speaker Playing Icon -->
                <svg className="nav-speaker-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              `
            : html`
                <!-- Speaker Muted Icon -->
                <svg className="nav-speaker-icon muted" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              `
          }
          <span className="action-btn-label">${isPlayingMusic ? 'Playing: Eagles - Love Will Keep Us Alive' : 'Play Original: Eagles - Love Will Keep Us Alive'}</span>
        </button>

        <!-- 2. Volume Button below Audio Button -->
        <div className="nav-volume-container" ref=${volumeRef}>
          <button
            onClick=${() => {
              soundService.playClick();
              setIsVolumePopoverOpen(!isVolumePopoverOpen);
            }}
            className=${`nav-action-btn btn-volume ${isVolumePopoverOpen ? 'active-volume' : ''}`}
            title=${`Volume: ${volume}%`}
            aria-label="Adjust Volume"
          >
            <!-- Dynamic Volume Level Icon -->
            ${volume === 0
              ? html`
                  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                `
              : volume < 50
              ? html`
                  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                `
              : html`
                  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                `
            }
            <span className="action-btn-label">${`Volume: ${volume}%`}</span>
          </button>

          <!-- Interactive Volume Popover Panel -->
          ${isVolumePopoverOpen && html`
            <div className="nav-volume-popover" role="dialog" aria-label="Volume Slider">
              <div className="volume-popover-header">
                <span className="volume-popover-title">Volume Control</span>
                <span className="volume-popover-value">${volume}%</span>
              </div>

              <!-- Track Song Info -->
              <div className="volume-song-badge">
                <span className="song-note-icon">🎵</span>
                <span className="song-title-text">Love Will Keep Us Alive • Eagles</span>
              </div>

              <!-- Range Slider -->
              <div className="volume-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value=${volume}
                  onInput=${(e) => handleVolumeChange(Number(e.target.value))}
                  className="volume-range-slider"
                  aria-label="Volume percentage"
                />
              </div>

              <!-- Quick Volume Presets -->
              <div className="volume-presets-row">
                <button
                  className=${`volume-preset-btn ${volume === 0 ? 'active' : ''}`}
                  onClick=${() => handleVolumePreset(0)}
                  title="Mute"
                >
                  0%
                </button>
                <button
                  className=${`volume-preset-btn ${volume === 25 ? 'active' : ''}`}
                  onClick=${() => handleVolumePreset(25)}
                  title="Default (25%)"
                >
                  25%
                </button>
                <button
                  className=${`volume-preset-btn ${volume === 50 ? 'active' : ''}`}
                  onClick=${() => handleVolumePreset(50)}
                  title="Medium"
                >
                  50%
                </button>
                <button
                  className=${`volume-preset-btn ${volume === 100 ? 'active' : ''}`}
                  onClick=${() => handleVolumePreset(100)}
                  title="Max"
                >
                  100%
                </button>
              </div>
            </div>
          `}
        </div>

        <!-- 3. Golden Confetti Fireworks Trigger -->
        <button
          onClick=${handleQuickCelebrate}
          className="nav-action-btn btn-celebrate"
          title="Celebration Spark"
          aria-label="Celebrate"
        >
          <span className="celebrate-icon">✦</span>
          <span className="action-btn-label">Celebrate</span>
        </button>
      </div>
    </aside>
  `;
};
