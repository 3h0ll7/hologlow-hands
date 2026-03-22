import { HandData } from '../constants';
import { drawGlassBeam, drawGlassHexagon } from '../drawingUtils';

export function renderPrism(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  if (hands.length === 2) {
    const [h1, h2] = hands;
    for (let f = 0; f < 5; f += 1) {
      const t1 = h1.fingertips[f];
      const t2 = h2.fingertips[f];
      for (let s = 0; s < 4; s += 1) {
        const hue = (f * 72 + s * 18 + time * 50) % 360;
        drawGlassBeam(ctx, { x: t1.x, y: t1.y + s * 3 }, { x: t2.x, y: t2.y + s * 3 }, hue, 6 + s);
        if (Math.random() < 0.05) emitParticle((t1.x + t2.x) / 2, (t1.y + t2.y) / 2, hue);
      }
    }
    const mx = (h1.center.x + h2.center.x) / 2;
    const my = (h1.center.y + h2.center.y) / 2;
    const dist = Math.hypot(h1.center.x - h2.center.x, h1.center.y - h2.center.y);
    for (let i = 0; i < 3; i += 1) {
      drawGlassHexagon(ctx, mx, my, dist * 0.15 * (1 + i * 0.38), (time * 80 + i * 120) % 360, time + i * 0.4, 1.2 - i * 0.18);
    }
    return;
  }

  hands.forEach((hand) => {
    hand.fingertips.forEach((tip, index) => {
      for (let r = 0; r < 3; r += 1) {
        const angle = time * 2 + r * ((Math.PI * 2) / 3);
        const len = 80 + Math.sin(time * 2 + index + r) * 40;
        const end = { x: tip.x + Math.cos(angle) * len, y: tip.y + Math.sin(angle) * len };
        drawGlassBeam(ctx, tip, end, (index * 72 + r * 40 + time * 50) % 360, 7);
      }
      drawGlassHexagon(ctx, tip.x, tip.y, 10, (index * 72 + time * 50) % 360, time * 3, 1.4);
    });
  });
}
