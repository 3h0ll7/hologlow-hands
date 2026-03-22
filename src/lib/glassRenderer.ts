import { GLASS_CONFIG, Point2D } from './constants';

function traceHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i + rotation;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawGlassHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  hue: number,
  rotation = 0,
  brighten = 1
) {
  ctx.save();
  traceHexagon(ctx, cx, cy, size, rotation);
  const body = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, size);
  body.addColorStop(0, `rgba(255,255,255,${GLASS_CONFIG.bodyAlpha * brighten})`);
  body.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = body;
  ctx.fill();

  traceHexagon(ctx, cx, cy, size, rotation);
  const border = ctx.createLinearGradient(cx - size, cy - size, cx + size, cy + size);
  border.addColorStop(0, `rgba(255,255,255,${0.7 * brighten})`);
  border.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.18)`);
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.3)`;
  ctx.shadowBlur = GLASS_CONFIG.shadowBlur;
  ctx.stroke();

  traceHexagon(ctx, cx - 2, cy - 2, size * 0.8, rotation);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.arc(cx - size * 0.25, cy - size * 0.28, Math.max(2, size * 0.1), 0, Math.PI * 2);
  ctx.shadowBlur = 4;
  ctx.fill();

  traceHexagon(ctx, cx, cy, size, rotation);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${GLASS_CONFIG.tintAlpha})`;
  ctx.fill();
  ctx.restore();
}

export function drawGlassBeam(
  ctx: CanvasRenderingContext2D,
  start: Point2D,
  end: Point2D,
  hue: number,
  width = 10
) {
  ctx.save();
  const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  gradient.addColorStop(0, 'rgba(255,255,255,0.02)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.18)');
  gradient.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.32)`;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,255,255,0.7)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

export function drawGlassRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  hue: number,
  thickness = 7,
  phase = 0
) {
  ctx.save();
  const gradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  gradient.addColorStop(0, 'rgba(255,255,255,0.04)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.16)');
  gradient.addColorStop(1, 'rgba(255,255,255,0.04)');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = thickness;
  ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.25)`;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,255,255,0.55)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, phase, phase + Math.PI / 3);
  ctx.stroke();
  ctx.restore();
}
