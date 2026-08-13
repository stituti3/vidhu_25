import { Navbar } from './components/Navbar.js?v=1786656180';
import { ParticleBackground } from './components/ParticleBackground.js?v=1786656180';
import { FullScreenEnvelope } from './components/FullScreenEnvelope.js?v=1786656180';
import { MemoryStoryPage } from './pages/MemoryStoryPage.js?v=1786656180';
import { LettersPage } from './pages/LettersPage.js?v=1786656180';
import { CakePage } from './pages/CakePage.js?v=1786656180';
import { BalloonGamePage } from './pages/BalloonGamePage.js?v=1786656180';
import { WriteLetterPage } from './pages/WriteLetterPage.js?v=1786656180';
import { soundService } from './services/soundEngine.js?v=1786656180';
import { letterStorage } from './services/letterStorage.js?v=1786656180';

const { useState, useEffect } = window.React;
const html = window.htm.bind(window.React.createElement);

export function App() {
  const [activePage, setActivePage] = useState('landing');
  const [navigationData, setNavigationData] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('theme-editorial');
  const [activeMemory, setActiveMemory] = useState(null);
  const [currentMemoryList, setCurrentMemoryList] = useState([]);
  const [hasSubmittedLetter, setHasSubmittedLetter] = useState(letterStorage.hasSubmittedLetter());

  // Check URL query parameters for Shareable Contributor Mode (?mode=write or ?write=1)
  const urlParams = new URLSearchParams(window.location.search);
  const isContributorMode = urlParams.get('mode') === 'write' || urlParams.get('write') === '1' || urlParams.has('write');

  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);

  useEffect(() => {
    if (activeMemory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeMemory]);

  const handleNavigate = (pageId, data = null) => {
    setActiveMemory(null);
    setHasSubmittedLetter(letterStorage.hasSubmittedLetter());
    setActivePage(pageId);
    setNavigationData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEnvelope = () => {
    setActiveMemory(null);
    setHasSubmittedLetter(letterStorage.hasSubmittedLetter());
    // In both modes, opening the envelope takes you to the Polaroid Wall (Page 2)
    setActivePage('memories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseLightbox = () => {
    soundService.playClick();
    setActiveMemory(null);
  };

  const handleDeleteActiveMemory = (e) => {
    e.stopPropagation();
    if (!activeMemory) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${activeMemory.type === 'video' ? 'video' : 'photo'}?`);
    if (confirmDelete) {
      soundService.playClick();
      letterStorage.deleteMemory(activeMemory.id);
      setActiveMemory(null);
    }
  };

  // Slideshow Handlers
  const handleNextMemory = (e) => {
    e.stopPropagation();
    if (!currentMemoryList || currentMemoryList.length === 0) return;
    const currentIndex = currentMemoryList.findIndex(m => m.id === activeMemory.id);
    if (currentIndex !== -1 && currentIndex < currentMemoryList.length - 1) {
      soundService.playClick();
      setActiveMemory(currentMemoryList[currentIndex + 1]);
    }
  };

  const handlePrevMemory = (e) => {
    e.stopPropagation();
    if (!currentMemoryList || currentMemoryList.length === 0) return;
    const currentIndex = currentMemoryList.findIndex(m => m.id === activeMemory.id);
    if (currentIndex > 0) {
      soundService.playClick();
      setActiveMemory(currentMemoryList[currentIndex - 1]);
    }
  };

  const isEnvelopeOpen = activePage !== 'landing';

  // Determine if next/prev arrows should be shown
  let showPrev = false;
  let showNext = false;
  if (activeMemory && currentMemoryList && currentMemoryList.length > 0) {
    const currentIndex = currentMemoryList.findIndex(m => m.id === activeMemory.id);
    showPrev = currentIndex > 0;
    showNext = currentIndex !== -1 && currentIndex < currentMemoryList.length - 1;
  }

  const renderActiveCardContent = () => {
    // 1. Contributor Mode (Strictly 3 Pages: 1. Landing Envelope, 2. Polaroid Wall with their photos, 3. Their Letter)
    if (isContributorMode) {
      switch (activePage) {
        case 'write_letter':
          return html`
            <${WriteLetterPage}
              onNavigate=${handleNavigate}
              initialLetterId=${navigationData}
              isContributorMode=${true}
            />
          `;
        case 'memories':
        default:
          return html`
            <${MemoryStoryPage}
              onNavigate=${handleNavigate}
              onSelectMemory=${(mem, list) => { setActiveMemory(mem); setCurrentMemoryList(list || []); }}
              isContributorMode=${true}
            />
          `;
      }
    }

    // 2. Full Celebrant Experience (Vidhanth & Host)
    switch (activePage) {
      case 'write_letter':
        return html`<${WriteLetterPage} onNavigate=${handleNavigate} initialLetterId=${navigationData} isContributorMode=${false} />`;
      case 'balloons':
        return html`<${BalloonGamePage} onNavigate=${handleNavigate} />`;
      case 'cake':
        return html`<${CakePage} onNavigate=${handleNavigate} />`;
      case 'letters':
        return html`<${LettersPage} onNavigate=${handleNavigate} />`;
      case 'memories':
      default:
        return html`<${MemoryStoryPage} onNavigate=${handleNavigate} onSelectMemory=${(mem, list) => { setActiveMemory(mem); setCurrentMemoryList(list || []); }} isContributorMode=${false} />`;
    }
  };

  return html`
    <div className="app-layout">
      <!-- Interactive Ambient Floating Particles -->
      <${ParticleBackground} />

      <!-- Vertical Left Sidebar Navigation / Music Player -->
      <${Navbar}
        activePage=${activePage}
        setActivePage=${setActivePage}
        currentTheme=${currentTheme}
        setCurrentTheme=${setCurrentTheme}
        isContributorMode=${isContributorMode}
        hasSubmittedLetter=${hasSubmittedLetter}
      />

      <!-- Full-Screen Envelope Container with Aged Beige Parchment & Wax Seal -->
      <${FullScreenEnvelope}
        isOpen=${isEnvelopeOpen}
        onOpen=${handleOpenEnvelope}
        activePage=${activePage}
        onNavigate=${handleNavigate}
        isContributorMode=${isContributorMode}
        hasSubmittedLetter=${hasSubmittedLetter}
      >
        ${renderActiveCardContent()}
      <//>

      <!-- True Centered Fullscreen Polaroid Lightbox Modal (Rendered at Root for 100% Center Alignment) -->
      ${activeMemory && html`
        <div
          className="polaroid-lightbox-backdrop"
          onClick=${handleCloseLightbox}
        >
          <div
            className="polaroid-lightbox-card"
            onClick=${(e) => e.stopPropagation()}
          >
            <!-- Washi Tape -->
            <div className="polaroid-washi-tape"></div>

            <!-- Top Action Controls -->
            <div className="polaroid-lightbox-controls">
              <button
                className="btn-lightbox-delete"
                onClick=${handleDeleteActiveMemory}
                title=${`Delete this ${activeMemory.type === 'video' ? 'video' : 'photo'} from Polaroid wall`}
              >
                🗑️ Delete ${activeMemory.type === 'video' ? 'Video' : 'Photo'}
              </button>
              
              <button
                className="polaroid-lightbox-close"
                onClick=${handleCloseLightbox}
                aria-label="Close Polaroid"
              >
                ✕
              </button>
            </div>

            <!-- Navigation Arrows -->
            ${showPrev && html`
              <button className="polaroid-nav-btn nav-btn-left" onClick=${handlePrevMemory} aria-label="Previous Memory">
                ❮
              </button>
            `}
            ${showNext && html`
              <button className="polaroid-nav-btn nav-btn-right" onClick=${handleNextMemory} aria-label="Next Memory">
                ❯
              </button>
            `}

            <!-- Photo or Video Area -->
            <div className="polaroid-lightbox-photo">
              ${activeMemory.type === 'video' ? html`
                <video
                  src=${activeMemory.videoUrl || activeMemory.image}
                  controls
                  autoPlay
                  playsInline
                  className="polaroid-lightbox-video-player"
                ></video>
              ` : html`
                <img
                  src=${activeMemory.image}
                  alt=${activeMemory.title || 'Memory'}
                />
              `}
            </div>

            <!-- Slim Handwritten Caption on Bottom Chin -->
            ${activeMemory.caption && html`
              <div className="polaroid-lightbox-caption font-rebecca">
                "${activeMemory.caption}"
              </div>
            `}

            <!-- Clean Minimal Date Stamp -->
            ${activeMemory.date && html`
              <div className="polaroid-lightbox-meta">
                ${activeMemory.date}
              </div>
            `}
          </div>
        </div>
      `}
    </div>
  `;
}
