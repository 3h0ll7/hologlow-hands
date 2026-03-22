import { HandData } from '../constants';

export function renderEnergy(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  for (const hand of hands) {
    const tips = hand.fingertips;
    // Lightning arcs between consecutive tips
    for (let i = 0; i < tips.length - 1; i++) {
      const a = tips[i], b = tips[i + 1];
      const hue = (i * 60 + time * 50) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, 0.8)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.5)`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      const segs = 12;
      for (let s = 1; s <= segs; s++) {
        const t = s / segs;
        const jx = (Math.random() - 0.5) * 20;
        const jy = (Math.random() - 0.5) * 20;
        ctx.lineTo(a.x + (b.x - a.x) * t + jx, a.y + (b.y - a.y) * t + jy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Particles from tips
    for (const tip of tips) {
      if (Math.random() < 0.15) emitParticle(tip.x, tip.y, (time * 50) % 360);
    }

    // Energy core at palm
    const pc = hand.palmCenter;
    for (let c = 0; c < 4; c++) {
      const r = (15 + c * 12) * (0.8 + Math.sin(time * 4 + c) * 0.2);
      const hue = (c * 90 + time * 60) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.5 - c * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pc.x, pc.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (hands.length === 2) {
    const p1 = hands[0].palmCenter, p2 = hands[1].palmCenter;
    for (let b = 0; b < 5; b++) {
      const hue = (b * 72 + time * 40) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      for (let s = 1; s <= 20; s++) {
        const t = s / 20;
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t + Math.sin(time * 4 + s * 0.5 + b) * 25;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
}
