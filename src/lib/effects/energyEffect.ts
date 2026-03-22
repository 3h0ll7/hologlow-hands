import { HandData } from '../constants';
import { drawGlassBeam, drawGlassRing } from '../drawingUtils';

export function renderEnergy(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  hands.forEach((hand) => {
    const tips = hand.fingertips;
    for (let i = 0; i < tips.length - 1; i += 1) {
      const a = tips[i];
      const b = tips[i + 1];
      drawGlassBeam(ctx, a, b, (i * 60 + time * 50) % 360, 8);
    }
    tips.forEach((tip) => {
      if (Math.random() < 0.15) emitParticle(tip.x, tip.y, (time * 50) % 360);
    });
    const pc = hand.palmCenter;
    for (let c = 0; c < 4; c += 1) {
      drawGlassRing(ctx, pc.x, pc.y, (15 + c * 12) * (0.8 + Math.sin(time * 4 + c) * 0.2), (c * 90 + time * 60) % 360, 8 - c);
    }
  });

  if (hands.length === 2) {
    const p1 = hands[0].palmCenter;
    const p2 = hands[1].palmCenter;
    drawGlassBeam(ctx, p1, p2, (time * 80) % 360, 12);
  }
}
