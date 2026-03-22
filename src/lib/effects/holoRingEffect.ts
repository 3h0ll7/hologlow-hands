import { HandData } from '../constants';
import { drawHexagon } from '../drawingUtils';

export function renderHoloRing(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number
) {
  for (const hand of hands) {
    const cx = hand.center.x, cy = hand.center.y;
    for (let ring = 0; ring < 5; ring++) {
      const radius = 40 + ring * 35;
      const hue = (ring * 60 + time * 30) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.5 - ring * 0.07})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let m = 0; m < 6; m++) {
        const angle = (m / 6) * Math.PI * 2 + time * (1 + ring * 0.3);
        const mx = cx + Math.cos(angle) * radius;
        const my = cy + Math.sin(angle) * radius;
        drawHexagon(ctx, mx, my, 6, time * 2, `hsla(${hue}, 100%, 70%, 0.7)`);
      }
    }

    // Dashed lines to fingertips with traveling dot
    for (let i = 0; i < hand.fingertips.length; i++) {
      const tip = hand.fingertips[i];
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = `hsla(${(i * 72 + time * 30) % 360}, 100%, 60%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const t = (Math.sin(time * 3 + i) + 1) / 2;
      const dx = cx + (tip.x - cx) * t;
      const dy = cy + (tip.y - cy) * t;
      ctx.fillStyle = `hsla(${(i * 72 + time * 30) % 360}, 100%, 70%, 0.9)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  if (hands.length === 2) {
    const mx = (hands[0].center.x + hands[1].center.x) / 2;
    const my = (hands[0].center.y + hands[1].center.y) / 2;
    const dist = Math.hypot(hands[0].center.x - hands[1].center.x, hands[0].center.y - hands[1].center.y);
    for (let i = 0; i < 3; i++) {
      const hue = (i * 120 + time * 40) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.5 - i * 0.12})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mx, my, dist * 0.35 * (0.5 + i * 0.3), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
