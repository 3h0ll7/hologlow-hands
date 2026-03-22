import { HandData } from '../constants';
import { drawHexagon } from '../drawingUtils';

export function renderVortex(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  for (const hand of hands) {
    const cx = hand.center.x, cy = hand.center.y;
    for (let arm = 0; arm < 6; arm++) {
      const armOffset = (arm / 6) * Math.PI * 2 + time * 2;
      for (let step = 0; step < 20; step++) {
        const angle = armOffset + step * 0.3;
        const baseR = 20;
        const r = baseR * Math.exp(0.15 * (step * 0.3));
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const nd = step / 20;
        const hue = (arm * 60 + step * 18 + time * 40) % 360;
        const alpha = Math.max(0, (1 - nd) * 0.7);
        const size = 8 * (1 - nd * 0.6);
        drawHexagon(ctx, x, y, size, time + step,
          `hsla(${hue}, 100%, 60%, ${alpha})`,
          `hsla(${hue}, 100%, 60%, ${alpha * 0.2})`);
        if (step === 19 && Math.random() < 0.1) emitParticle(x, y, hue);
      }
    }
  }

  if (hands.length === 2) {
    const [h1, h2] = hands;
    for (let i = 0; i < 15; i++) {
      const t = i / 15;
      const angle = time * 3 + t * Math.PI * 4;
      const x = h1.center.x + (h2.center.x - h1.center.x) * t + Math.sin(angle) * 20;
      const y = h1.center.y + (h2.center.y - h1.center.y) * t + Math.cos(angle) * 20;
      const hue = (t * 360 + time * 50) % 360;
      drawHexagon(ctx, x, y, 8, time + i,
        `hsla(${hue}, 100%, 60%, 0.6)`,
        `hsla(${hue}, 100%, 60%, 0.15)`);
    }
  }
}
