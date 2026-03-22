import { HAND_CONNECTIONS, FINGERTIP_INDICES, COLORS, Particle } from './constants';

export function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number,
  rotation: number = 0,
  strokeColor: string = COLORS.cyan,
  fillColor?: string,
  lineWidth: number = 1.5
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + rotation;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
  w: number, h: number
) {
  // Lines
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 3;
  ctx.shadowColor = COLORS.green;
  ctx.shadowBlur = 8;
  for (const [a, b] of HAND_CONNECTIONS) {
    const la = landmarks[a], lb = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(la.x * w, la.y * h);
    ctx.lineTo(lb.x * w, lb.y * h);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Dots
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const isTip = FINGERTIP_INDICES.includes(i);
    const r = isTip ? 7 : 5;
    ctx.fillStyle = COLORS.red;
    if (isTip) { ctx.shadowColor = COLORS.red; ctx.shadowBlur = 15; }
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, r, 0, Math.PI * 2);
    ctx.fill();
    if (isTip) {
      ctx.strokeStyle = COLORS.red;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, r + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    if (!p.active) continue;
    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    const size = p.size * (1 - p.life / p.maxLife * 0.6);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
