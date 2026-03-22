import { COLORS, FINGERTIP_INDICES, HAND_CONNECTIONS, Particle, Point2D } from './constants';
import { drawGlassBeam, drawGlassHexagon, drawGlassRing } from './glassRenderer';

export function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation = 0,
  strokeColor: string = COLORS.cyan,
  fillColor?: string,
  lineWidth = 1.5
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i + rotation;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
  w: number,
  h: number,
  active = false
) {
  ctx.strokeStyle = active ? COLORS.cyan : COLORS.green;
  ctx.lineWidth = 3;
  ctx.shadowColor = active ? COLORS.cyan : COLORS.green;
  ctx.shadowBlur = 8;
  HAND_CONNECTIONS.forEach(([a, b]) => {
    const la = landmarks[a];
    const lb = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(la.x * w, la.y * h);
    ctx.lineTo(lb.x * w, lb.y * h);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  landmarks.forEach((lm, i) => {
    const isTip = FINGERTIP_INDICES.includes(i as (typeof FINGERTIP_INDICES)[number]);
    const r = isTip ? 7 : 5;
    ctx.fillStyle = i === 8 && active ? COLORS.cyan : COLORS.red;
    if (isTip) {
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;
    }
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, r, 0, Math.PI * 2);
    ctx.fill();
    if (isTip) {
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, r + 3 + (active && i === 8 ? Math.sin(performance.now() / 150) * 2 : 0), 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  });
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    if (!p.active) return;
    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    const size = p.size * (1 - (p.life / p.maxLife) * 0.6);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawNeonStroke(ctx: CanvasRenderingContext2D, points: Point2D[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(1.5, width * 0.25);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.restore();
}

export { drawGlassHexagon, drawGlassBeam, drawGlassRing };
