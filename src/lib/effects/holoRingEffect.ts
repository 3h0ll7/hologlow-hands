import { HandData } from '../constants';
import { drawGlassBeam, drawGlassHexagon, drawGlassRing } from '../drawingUtils';

export function renderHoloRing(ctx: CanvasRenderingContext2D, hands: HandData[], time: number) {
  hands.forEach((hand) => {
    const cx = hand.center.x;
    const cy = hand.center.y;
    for (let ring = 0; ring < 5; ring += 1) {
      const radius = 40 + ring * 35;
      const hue = (ring * 60 + time * 40) % 360;
      drawGlassRing(ctx, cx, cy, radius, hue, 6 - ring * 0.4, time + ring * 0.6);
      for (let m = 0; m < 6; m += 1) {
        const angle = (m / 6) * Math.PI * 2 + time * (1 + ring * 0.3);
        drawGlassHexagon(ctx, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 6, hue, time * 2, 1.2);
      }
    }

    hand.fingertips.forEach((tip, index) => {
      drawGlassBeam(ctx, hand.center, tip, (index * 72 + time * 30) % 360, 5);
    });
  });
}
