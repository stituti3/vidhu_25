// Audio and Sound Engine
// Plays the authentic original recording of "Love Will Keep Us Alive" by The Eagles + Web Audio Sound Effects

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.25; // Default volume set to 25% (0.25)
    this.lastAudioTime = 0; // Explicitly preserves exact track timestamp when paused
    this.songTitle = "Love Will Keep Us Alive - Eagles";
    this.audioSrc = "./src/assets/audio/eagles-love-will-keep-us-alive.mp3";
    this.audio = null;
    this.isPlayingAudio = false;
    this.listeners = new Set();
  }

  init() {
    // 1. Initialize Web Audio Context for Sound Effects
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // 2. Initialize HTML5 Audio Element for Original Studio Track
    if (!this.audio) {
      this.audio = new Audio(this.audioSrc);
      this.audio.loop = true;
      this.audio.volume = this.isMuted ? 0 : this.volume;
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => {
        this.isPlayingAudio = true;
        this.notifyListeners();
      });

      this.audio.addEventListener('pause', () => {
        if (this.audio) {
          this.lastAudioTime = this.audio.currentTime;
        }
        this.isPlayingAudio = false;
        this.notifyListeners();
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio && !this.audio.paused) {
          this.lastAudioTime = this.audio.currentTime;
        }
      });

      this.audio.addEventListener('ended', () => {
        this.isPlayingAudio = false;
        this.notifyListeners();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn("Original audio file error, retrying...", e);
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn({
      isPlaying: this.isPlayingAudio,
      volume: this.volume,
      isMuted: this.isMuted
    }));
  }

  // Set Master Volume (0.0 to 1.0)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.init();

    // Update Original Track Volume
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }

    // Update SFX Master Gain
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    this.notifyListeners();
    return this.volume;
  }

  getVolume() {
    return this.volume;
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.init();

    if (this.audio) {
      this.audio.volume = muted ? 0 : this.volume;
    }

    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    this.notifyListeners();
  }

  // Play Original "Love Will Keep Us Alive" by The Eagles (Continues from where it left off)
  async playOriginalSong() {
    this.init();
    if (!this.audio) return false;

    try {
      this.audio.volume = this.isMuted ? 0 : this.volume;
      
      // Resume exactly from last paused timestamp
      if (this.lastAudioTime > 0 && Math.abs(this.audio.currentTime - this.lastAudioTime) > 0.5) {
        this.audio.currentTime = this.lastAudioTime;
      }
      
      await this.audio.play();
      this.isPlayingAudio = true;
      this.notifyListeners();
      return true;
    } catch (e) {
      console.warn("Autoplay blocked or playback error:", e);
      return false;
    }
  }

  pauseOriginalSong() {
    if (this.audio) {
      this.lastAudioTime = this.audio.currentTime;
      this.audio.pause();
      this.isPlayingAudio = false;
      this.notifyListeners();
    }
  }

  toggleMelody() {
    this.init();
    if (this.isPlayingAudio) {
      this.pauseOriginalSong();
      return false;
    } else {
      this.playOriginalSong();
      return true;
    }
  }

  // ==========================================
  // Web Audio UI Sound Effects
  // ==========================================

  playTone(freq, duration = 0.3, type = 'sine', decay = 0.25, volumeScale = 0.4) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volumeScale, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Sound FX: Soft interaction click
  playClick() {
    this.playTone(520, 0.08, 'triangle', 0.05, 0.35);
  }

  // Sound FX: Magic sparkle / star chime
  playSparkle() {
    if (this.isMuted) return;
    const notes = [587.33, 659.25, 880.00, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, 'sine', 0.25, 0.3);
      }, idx * 60);
    });
  }

  // Sound FX: Balloon pop
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Sound FX: Candle blow out
  playBlow() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start();
    } catch (e) {}
  }

  // Sound FX: Crowd clapping
  playFanfare() {
    if (this.isMuted) return;
    try {
      // Simulate clapping with overlapping noise bursts
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          this.playClap();
        }, Math.random() * 2000);
      }
    } catch (e) {}
  }

  playClap() {
    if (this.isMuted || !this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15); // 150ms clap
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + Math.random() * 1000;
      filter.Q.value = 1;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.2, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      whiteNoise.start();
    } catch(e) {}
  }
}

export const soundService = new SoundEngine();
