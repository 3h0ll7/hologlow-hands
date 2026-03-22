import { HandData } from '../constants';
import { drawGlassHexagon } from '../drawingUtils';

export function renderHexGrid(ctx: CanvasRenderingContext2D, hands: HandData[], time: number) {
  const size = 30;
  const sqrt3 = Math.sqrt(3);

  hands.forEach((hand) => {
    const cx = hand.center.x;
    const cy = hand.center.y;
    const maxR = 4;
    for (let q = -maxR; q <= maxR; q += 1) {
      for (let r = -maxR; r <= maxR; r += 1) {
        if (Math.abs(q + r) > maxR) continue;
        const hx = cx + size * ((3 / 2) * q);
        const hy = cy + size * ((sqrt3 / 2) * q + sqrt3 * r);
        const dist = Math.hypot(hx - cx, hy - cy);
        const nd = Math.min(dist / (size * maxR * 1.8), 1);
        const highlight = hand.fingertips.some(t => Math.hypot(t.x - hx, t.y - hy) < size) ? 1.6 : 0.8 + (1 - nd) * 0.6;
        drawGlassHexagon(ctx, hx, hy, size * 0.45, (nd * 180 + time * 40) % 360, time * 0.2, highlight);
      }
    }
  });
}
