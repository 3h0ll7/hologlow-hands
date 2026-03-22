import { HandData } from '../constants';
import { drawGlassBeam, drawGlassHexagon } from '../drawingUtils';

export function renderVortex(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  hands.forEach((hand) => {
    const cx = hand.center.x;
    const cy = hand.center.y;
    for (let arm = 0; arm < 6; arm += 1) {
      const armOffset = (arm / 6) * Math.PI * 2 + time * 2;
      let lastPoint = { x: cx, y: cy };
      for (let step = 0; step < 20; step += 1) {
        const angle = armOffset + step * 0.3;
        const r = 20 * Math.exp(0.15 * (step * 0.3));
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const hue = (arm * 60 + step * 18 + time * 40) % 360;
        drawGlassHexagon(ctx, x, y, 8 * (1 - (step / 20) * 0.6), hue, time + step, 1 - step / 30);
        drawGlassBeam(ctx, lastPoint, { x, y }, hue, 3);
        lastPoint = { x, y };
        if (step === 19 && Math.random() < 0.1) emitParticle(x, y, hue);
      }
    }
  });
}
