import { CosmicCanvasEngine } from '../services/particleCanvas.js';

const { useEffect, useRef } = window.React;
const html = window.htm.bind(window.React.createElement);

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let engine = null;
    if (canvasRef.current) {
      engine = new CosmicCanvasEngine(canvasRef.current);
    }
    return () => {
      if (engine) engine.destroy();
    };
  }, []);

  return html`
    <canvas id="particle-canvas" ref=${canvasRef}></canvas>
    <div className="nebula-glow-1"></div>
    <div className="nebula-glow-2"></div>
  `;
};
