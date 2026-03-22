import { HandData } from '../constants';
import { drawHexagon } from '../drawingUtils';

export function renderHexGrid(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number
) {
  const size = 30;
  const sqrt3 = Math.sqrt(3);

  for (const hand of hands) {
    const cx = hand.center.x, cy = hand.center.y;
    const maxR = 4;
    for (let q = -maxR; q <= maxR; q++) {
      for (let r = -maxR; r <= maxR; r++) {
        if (Math.abs(q + r) > maxR) continue;
        const hx = cx + size * (3 / 2 * q);
        const hy = cy + size * (sqrt3 / 2 * q + sqrt3 * r);
        const dist = Math.hypot(hx - cx, hy - cy);
        const maxDist = size * maxR * 1.8;
        const nd = Math.min(dist / maxDist, 1);
        const hue = (nd * 180 + time * 30) % 360;
        const alpha = Math.max(0, (1 - nd * 0.8) * Math.sin(time * 3 - nd * 4));
        if (alpha < 0.05) continue;

        const isTip = hand.fingertips.some(t => Math.hypot(t.x - hx, t.y - hy) < size);
        const stroke = `hsla(${hue}, 100%, 60%, ${alpha})`;
        const fill = `hsla(${hue}, 100%, 60%, ${alpha * 0.15})`;

        if (isTip) {
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
          ctx.shadowBlur = 15;
        }
        drawHexagon(ctx, hx, hy, size * 0.45, 0, stroke, fill);
        ctx.shadowBlur = 0;
      }
    }
  }

  if (hands.length === 2) {
    const [h1, h2] = hands;
    for (let i = 0; i < 8; i++) {
      const t = (i + 1) / 9;
      const x = h1.center.x + (h2.center.x - h1.center.x) * t;
      const y = h1.center.y + (h2.center.y - h1.center.y) * t + Math.sin(time * 3 + i) * 20;
      const hue = (i * 45 + time * 40) % 360;
      drawHexagon(ctx, x, y, 15, time + i, `hsla(${hue}, 100%, 60%, 0.7)`, `hsla(${hue}, 100%, 60%, 0.1)`);
    }
  }
}
