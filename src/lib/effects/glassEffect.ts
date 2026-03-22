import { HandData } from '../constants';
import { drawGlassBeam, drawGlassHexagon } from '../glassRenderer';

export function renderGlass(ctx: CanvasRenderingContext2D, hands: HandData[], time: number) {
  hands.forEach((hand, handIndex) => {
    for (let i = 0; i < 6; i += 1) {
      const angle = time * 0.8 + (i / 6) * Math.PI * 2;
      const radius = 70 + i * 12;
      const x = hand.center.x + Math.cos(angle) * radius;
      const y = hand.center.y + Math.sin(angle) * (radius * 0.6);
      const nearFinger = hand.fingertips.some(tip => Math.hypot(tip.x - x, tip.y - y) < 80);
      drawGlassHexagon(ctx, x, y, 24 + i * 4, (handIndex * 140 + i * 50 + time * 40) % 360, angle * 0.4, nearFinger ? 1.5 : 1);
      drawGlassBeam(ctx, hand.center, { x, y }, (i * 50 + time * 30) % 360, 5 + i * 0.5);
    }
  });

  if (hands.length === 2) {
    const [a, b] = hands;
    for (let i = 0; i < 5; i += 1) {
      const t = (i + 1) / 6;
      const x = a.center.x + (b.center.x - a.center.x) * t;
      const y = a.center.y + (b.center.y - a.center.y) * t + Math.sin(time * 3 + i) * 18;
      drawGlassHexagon(ctx, x, y, 22, (time * 90 + i * 36) % 360, time + i, 1.4);
    }
  }
}
