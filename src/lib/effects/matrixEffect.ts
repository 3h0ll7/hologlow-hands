import { HandData } from '../constants';
import { drawHexagon } from '../drawingUtils';

export function renderMatrix(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number
) {
  const spacing = 35;
  for (const hand of hands) {
    const ox = hand.center.x - (12 * spacing) / 2;
    const oy = hand.center.y - (10 * spacing) / 2;
    for (let gx = 0; gx < 12; gx++) {
      for (let gy = 0; gy < 10; gy++) {
        const cx = ox + gx * spacing;
        const cy = oy + gy * spacing;
        let minDist = Infinity;
        for (const tip of hand.fingertips) {
          const d = Math.hypot(tip.x - cx, tip.y - cy);
          if (d < minDist) minDist = d;
        }
        const influence = Math.max(0, 1 - minDist / 150);
        if (influence < 0.05) continue;
        const size = 4 + influence * 12;
        const hue = (180 + influence * 120 + time * 20) % 360;
        const alpha = influence * 0.8;
        drawHexagon(ctx, cx, cy, size, 0,
          `hsla(${hue}, 100%, 60%, ${alpha})`,
          `hsla(${hue}, 100%, 60%, ${alpha * 0.3})`);
      }
    }
  }
}
