// Interactive Canvas Particle & Cosmic Stardust Engine

export class CosmicCanvasEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.animationFrameId = null;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Track mouse / touch for interactive stardust sparklers
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
      this.addStardust(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.active = true;
        this.addStardust(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.createStars();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.createStars();
  }

  createStars() {
    this.stars = [];
    const count = Math.min(Math.floor((this.width * this.height) / 8000), 150);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        color: ['#ffffff', '#fbcfe8', '#e9d5ff', '#bae6fd', '#fde68a'][Math.floor(Math.random() * 5)]
      });
    }
  }

  addStardust(x, y) {
    if (this.particles.length > 80) return;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        radius: Math.random() * 2.2 + 1,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        color: ['#fbbf24', '#f472b6', '#a855f7', '#38bdf8'][Math.floor(Math.random() * 4)]
      });
    }
  }

  burst(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#38bdf8', '#fde047'][Math.floor(Math.random() * 6)]
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background stars
    for (let star of this.stars) {
      star.alpha += star.speed;
      const currentAlpha = Math.abs(Math.sin(star.alpha));

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = currentAlpha * 0.8;
      this.ctx.fill();
    }

    // Draw & update interactive stardust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.globalAlpha = 1;
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
