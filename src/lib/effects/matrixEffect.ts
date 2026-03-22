import { HandData } from '../constants';
import { drawGlassHexagon } from '../drawingUtils';

export function renderMatrix(ctx: CanvasRenderingContext2D, hands: HandData[], time: number) {
  const spacing = 35;
  hands.forEach((hand) => {
    const ox = hand.center.x - (12 * spacing) / 2;
    const oy = hand.center.y - (10 * spacing) / 2;
    for (let gx = 0; gx < 12; gx += 1) {
      for (let gy = 0; gy < 10; gy += 1) {
        const cx = ox + gx * spacing;
        const cy = oy + gy * spacing;
        const minDist = Math.min(...hand.fingertips.map(tip => Math.hypot(tip.x - cx, tip.y - cy)));
        const influence = Math.max(0, 1 - minDist / 150);
        if (influence < 0.05) continue;
        drawGlassHexagon(ctx, cx, cy, 4 + influence * 12, (180 + influence * 120 + time * 20) % 360, 0, 0.8 + influence);
      }
    }
  });
}
