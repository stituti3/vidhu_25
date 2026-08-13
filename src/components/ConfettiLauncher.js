// Canvas Confetti Celebration Engine with Rich Golden Palette & Spring Ribbons

const GOLD_PALETTE = [
  '#ffd700', // Pure Bright Gold
  '#f59e0b', // Rich Amber Gold
  '#d97706', // Warm Deep Gold
  '#fef08a', // Light Champagne
  '#fde047', // Shimmering Yellow Gold
  '#ffb703', // Warm Sunlight Gold
  '#e0a96d', // Rose Gold Tint
  '#fffbeb', // Pearlescent White-Gold
  '#b45309'  // Antique Bronze Gold
];

export const launchConfetti = (type = 'fireworks') => {
  if (typeof window.confetti !== 'function') return;

  // Generate spring/spiral shapes if shapeFromPath is supported
  let shapes = ['star', 'circle', 'square'];
  if (typeof window.confetti.shapeFromPath === 'function') {
    try {
      const springPath = window.confetti.shapeFromPath({
        path: 'M 0,25 C 10,-5 25,45 40,15 C 55,-10 70,40 85,20'
      });
      const spiralPath = window.confetti.shapeFromPath({
        path: 'M 20,0 C 35,0 40,15 30,25 C 18,35 5,20 12,10 C 18,3 28,8 26,16'
      });
      shapes = [springPath, spiralPath, 'star', 'circle'];
    } catch (e) {
      shapes = ['star', 'circle', 'square'];
    }
  }

  if (type === 'fireworks' || type === 'standard') {
    // 1. Instant Golden Explosion Cannon Burst with Springs & Stars
    window.confetti({
      particleCount: 85,
      spread: 90,
      startVelocity: 42,
      origin: { y: 0.65 },
      colors: GOLD_PALETTE,
      shapes: shapes,
      scalar: 1.25,
      ticks: 350,
      gravity: 0.75,
      drift: 0.05,
      zIndex: 9999
    });

    // 2. Twin Side Gold Ribbon & Spring Streamers
    window.confetti({
      particleCount: 50,
      angle: 60,
      spread: 75,
      origin: { x: 0.1, y: 0.75 },
      colors: GOLD_PALETTE,
      shapes: shapes,
      scalar: 1.4,
      ticks: 400,
      gravity: 0.65,
      drift: 0.1,
      zIndex: 9999
    });

    window.confetti({
      particleCount: 50,
      angle: 120,
      spread: 75,
      origin: { x: 0.9, y: 0.75 },
      colors: GOLD_PALETTE,
      shapes: shapes,
      scalar: 1.4,
      ticks: 400,
      gravity: 0.65,
      drift: -0.1,
      zIndex: 9999
    });

    // 3. Cascading Golden Sky Shower for 2.5 seconds
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 25 * (timeLeft / duration);
      window.confetti({
        particleCount,
        startVelocity: 25,
        spread: 360,
        ticks: 250,
        origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.15 },
        colors: GOLD_PALETTE,
        shapes: shapes,
        scalar: randomInRange(0.9, 1.3),
        gravity: 0.7,
        zIndex: 9999
      });
    }, 220);

  } else if (type === 'stars') {
    window.confetti({
      particleCount: 75,
      spread: 110,
      startVelocity: 35,
      origin: { y: 0.6 },
      shapes: ['star', ...shapes],
      colors: GOLD_PALETTE,
      scalar: 1.3,
      ticks: 300,
      gravity: 0.7,
      zIndex: 9999
    });
  }
};

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
