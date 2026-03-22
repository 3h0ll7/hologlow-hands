import { HandData } from '../constants';
import { drawGlassBeam, drawGlassHexagon } from '../glassRenderer';

export function renderGlass(ctx: CanvasRenderingContext2D, hands: HandData[], time: number) {
  hands.forEach((hand, handIndex) => {
    for (let panel = 0; panel < 6; panel += 1) {
      const angle = time * 0.5 + (panel / 6) * Math.PI * 2;
      const radius = 70 + panel * 24;
      const x = hand.center.x + Math.cos(angle) * radius;
      const y = hand.center.y + Math.sin(angle) * (radius * 0.7);
      drawGlassHexagon(ctx, x, y, 50, (handIndex * 120 + panel * 45 + time * 55) % 360, angle * 0.5, 1.15);
      drawGlassBeam(ctx, hand.center, { x, y }, (panel * 55 + time * 40) % 360, 4);
    }
  });

  if (hands.length === 2) {
    const [leftHand, rightHand] = hands;
    for (let segment = 0; segment < 5; segment += 1) {
      const t = (segment + 1) / 6;
      const x = leftHand.center.x + (rightHand.center.x - leftHand.center.x) * t;
      const y = leftHand.center.y + (rightHand.center.y - leftHand.center.y) * t;
      drawGlassHexagon(ctx, x, y, 28, (time * 80 + segment * 36) % 360, time * 0.3 + segment * 0.2, 1.35);
    }
    drawGlassBeam(ctx, leftHand.center, rightHand.center, (time * 90) % 360, 10);
  }
}
