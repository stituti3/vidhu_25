import { soundService } from '../services/soundEngine.js?v=1786612520';

const { useState, useEffect } = window.React;
const html = window.htm.bind(window.React.createElement);

export const ShareModal = ({ isOpen, onClose, onNavigate, mode = 'write' }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('worldwide'); // 'worldwide' | 'local'
  const [tunnelData, setTunnelData] = useState({
    publicUrl: 'https://f844418fe136b9.lhr.life',
    status: 'online'
  });
  const [isLoadingTunnel, setIsLoadingTunnel] = useState(false);

  // Fetch latest live tunnel URL from server
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingTunnel(true);
    fetch('/api/tunnel')
      .then(res => res.json())
      .then(data => {
        if (data && data.publicUrl) {
          setTunnelData(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch tunnel endpoint:', err);
      })
      .finally(() => {
        setIsLoadingTunnel(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const isCelebrantCard = mode === 'celebrant';
  const pathname = window.location.pathname.replace(/\/$/, '');

  // 1. Worldwide Public HTTPS Link (Accessible from ANY phone/network in the world)
  const publicBase = tunnelData.publicUrl || 'https://f844418fe136b9.lhr.life';
  const worldwideUrl = isCelebrantCard
    ? `${publicBase}${pathname || '/'}`
    : `${publicBase}${pathname}/?mode=write`;

  // 2. Direct Local URL (for your current browser/computer)
  const localUrl = isCelebrantCard
    ? `${window.location.origin}${pathname || '/'}`
    : `${window.location.origin}${pathname}/?mode=write`;

  // Selected Active URL
  const primaryUrl = activeTab === 'local' ? localUrl : worldwideUrl;

  // Generate QR Code URL for phone scanning (always encoded with worldwide URL so any phone camera opens it)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(worldwideUrl)}&margin=8&color=330509&bgcolor=faf4eb`;

  const handleCopy = (url) => {
    soundService.playClick();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    soundService.playClick();
    if (navigator.share) {
      navigator.share({
        title: isCelebrantCard ? "Happy 25th Birthday Vidhanth! 🎂" : "Write a Birthday Letter for Vidhanth ♡",
        text: isCelebrantCard 
          ? "A special interactive birthday celebration made for Vidhanth's 25th Birthday! Open your sealed envelope here:"
          : "Join us in celebrating Vidhanth's 25th birthday! Open this link on your phone to write your letter and attach a memory:",
        url: worldwideUrl,
      }).catch(() => {});
    } else {
      handleCopy(worldwideUrl);
    }
  };

  return html`
    <div className="share-modal-backdrop" onClick=${onClose}>
      <div className="share-modal-card" onClick=${(e) => e.stopPropagation()}>
        
        <!-- Washi Tape Decor -->
        <div className="polaroid-washi-tape"></div>

        <!-- Close Button -->
        <button
          className="share-modal-close"
          onClick=${() => {
            soundService.playClick();
            onClose();
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <!-- Header -->
        <div className="share-modal-header">
          <div className="share-modal-wax-icon font-rebecca">V</div>
          <h2 className="share-modal-title font-rebecca">
            ${isCelebrantCard ? 'Share Birthday Card with Vidhanth 🎁' : 'Invite Friends to Write a Letter 💌'}
          </h2>
          <p className="share-modal-subtitle">
            ${isCelebrantCard
              ? 'Send this link to Vidhanth so he can experience the entire celebration on ANY phone or computer — opening his wax-sealed envelope, viewing memories, reading all letters, blowing his 25 candles, and catching roses!'
              : 'Share this link with any friend. It opens on ANY phone, mobile network (4G/5G), or computer anywhere in the world!'}
          </p>
        </div>

        <!-- Worldwide Online Status Pill -->
        <div style=${{ textAlign: 'center', marginBottom: '14px' }}>
          <span style=${{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(34, 139, 34, 0.12)',
            border: '1px solid rgba(34, 139, 34, 0.3)',
            color: '#1e6823',
            fontSize: '0.82rem',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            <span style=${{ width: '8px', height: '8px', borderRadius: '50%', background: '#28a745', display: 'inline-block' }}></span>
            Worldwide Public Access Active (No Wi-Fi restrictions)
          </span>
        </div>

        <!-- Direct Action: Write Letter on this Device -->
        ${!isCelebrantCard && onNavigate && html`
          <div style=${{ marginBottom: '16px', textAlign: 'center' }}>
            <button
              onClick=${() => {
                soundService.playSparkle();
                onClose();
                onNavigate('write_letter');
              }}
              className="btn btn-gold"
              style=${{ width: '100%', padding: '12px 20px', fontSize: '1.02rem', fontWeight: 'bold' }}
            >
              <span>✍️ Write / Add My Letter Right Now →</span>
            </button>
          </div>
        `}

        <!-- Tab Selector: Worldwide vs This Device -->
        <div style=${{ display: 'flex', gap: '8px', marginBottom: '14px', justifyContent: 'center' }}>
          <button
            onClick=${() => {
              soundService.playClick();
              setActiveTab('worldwide');
            }}
            className=${`btn ${activeTab === 'worldwide' ? 'btn-gold' : 'btn-secondary'}`}
            style=${{ padding: '7px 16px', fontSize: '0.88rem', fontWeight: activeTab === 'worldwide' ? '600' : 'normal' }}
          >
            🌍 Worldwide Link (Any Phone / Any Wi-Fi)
          </button>
          <button
            onClick=${() => {
              soundService.playClick();
              setActiveTab('local');
            }}
            className=${`btn ${activeTab === 'local' ? 'btn-gold' : 'btn-secondary'}`}
            style=${{ padding: '7px 16px', fontSize: '0.88rem' }}
          >
            💻 This Computer
          </button>
        </div>

        <!-- QR Code for Instant Phone Camera Scan -->
        <div className="share-qr-section">
          <div className="share-qr-frame">
            <img src=${qrCodeUrl} alt="Scan QR Code to open on any phone" className="share-qr-image" />
          </div>
          <span className="share-qr-hint font-rebecca">
            ${isCelebrantCard ? 'Scan with ANY phone camera to open card' : 'Scan with ANY phone camera to write your letter'}
          </span>
        </div>

        <!-- Copy URL Input -->
        <div className="share-url-box">
          <label className="share-url-label">
            ${activeTab === 'worldwide' ? 'Worldwide Share Link (Works on Any Device):' : 'Direct Link (for this computer):'}
          </label>
          <div className="share-url-input-wrap">
            <input
              type="text"
              readOnly
              value=${primaryUrl}
              className="share-url-input"
              onClick=${(e) => e.target.select()}
            />
            <button
              onClick=${() => handleCopy(primaryUrl)}
              className="btn btn-gold btn-copy-url"
            >
              <span>${copied ? 'Copied! ✓' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <!-- Share Actions -->
        <div className="share-modal-actions" style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href=${primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style=${{ flex: '1', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick=${() => soundService.playClick()}
          >
            <span>Open Link in Browser ↗</span>
          </a>
          
          <button
            onClick=${handleNativeShare}
            className="btn btn-gold btn-native-share"
            style=${{ flex: '1' }}
          >
            <span>Share Link 📲</span>
          </button>
          
          <button
            onClick=${() => {
              soundService.playClick();
              onClose();
            }}
            className="btn btn-secondary btn-done-share"
            style=${{ flex: '0 0 auto' }}
          >
            <span>Done</span>
          </button>
        </div>

      </div>
    </div>
  `;
};
