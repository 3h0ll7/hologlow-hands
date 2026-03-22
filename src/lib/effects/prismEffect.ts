import { HandData, Particle } from '../constants';
import { drawHexagon } from '../drawingUtils';

export function renderPrism(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  if (hands.length === 2) {
    const [h1, h2] = hands;
    for (let f = 0; f < 5; f++) {
      const t1 = h1.fingertips[f], t2 = h2.fingertips[f];
      for (let s = 0; s < 5; s++) {
        const hue = (f * 72 + s * 15 + time * 50) % 360;
        const off = Math.sin(time * 3 + s * 0.5 + f) * 15;
        const mx = (t1.x + t2.x) / 2, my = (t1.y + t2.y) / 2 + off;
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.7)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y + s * 3);
        ctx.quadraticCurveTo(mx, my, t2.x, t2.y + s * 3);
        ctx.stroke();
        if (Math.random() < 0.05) emitParticle(mx, my, hue);
      }
    }
    ctx.shadowBlur = 0;
    const mx = (h1.center.x + h2.center.x) / 2;
    const my = (h1.center.y + h2.center.y) / 2;
    const dist = Math.hypot(h1.center.x - h2.center.x, h1.center.y - h2.center.y);
    for (let i = 0; i < 3; i++) {
      const hue = (i * 120 + time * 40) % 360;
      drawHexagon(ctx, mx, my, dist * 0.15 * (1 + i * 0.4), time + i * 0.5,
        `hsla(${hue}, 100%, 60%, ${0.6 - i * 0.15})`);
    }
  } else if (hands.length === 1) {
    const h = hands[0];
    for (let i = 0; i < 5; i++) {
      const tip = h.fingertips[i];
      for (let r = 0; r < 3; r++) {
        const angle = time * 2 + r * (Math.PI * 2 / 3);
        const len = 80 + Math.sin(time * 2 + i + r) * 40;
        const hue = (i * 72 + r * 40 + time * 50) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.6)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x + Math.cos(angle) * len, tip.y + Math.sin(angle) * len);
        ctx.stroke();
      }
      drawHexagon(ctx, tip.x, tip.y, 10, time * 3,
        `hsla(${(i * 72 + time * 50) % 360}, 100%, 60%, 0.8)`);
    }
    ctx.shadowBlur = 0;
  }
}
