import { HandData } from '../constants';
import { buildRibbonMesh, RibbonSample } from '../ribbonGeometry';

export type RibbonMode = 'SILK' | 'NEON_STRIP' | 'RAINBOW' | 'FIRE';

function drawRibbonMesh(
  ctx: CanvasRenderingContext2D,
  points: RibbonSample[],
  baseHue: number,
  mode: RibbonMode = 'SILK'
) {
  const mesh = buildRibbonMesh(points, mode === 'FIRE' ? 30 : mode === 'NEON_STRIP' ? 15 : 25);
  if (mesh.topEdge.length < 2) return;

  const head = mesh.center[mesh.center.length - 1];
  const tail = mesh.center[0];
  const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
  gradient.addColorStop(0, `hsla(${baseHue}, 100%, 60%, 0)`);
  gradient.addColorStop(0.4, `hsla(${(baseHue + 60) % 360}, 100%, 70%, ${mode === 'NEON_STRIP' ? 0.7 : 0.45})`);
  gradient.addColorStop(1, `hsla(${(baseHue + 140) % 360}, 100%, 72%, ${mode === 'NEON_STRIP' ? 0.95 : 0.7})`);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(mesh.topEdge[0].x, mesh.topEdge[0].y);
  mesh.topEdge.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  mesh.bottomEdge.slice().reverse().forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = `hsla(${baseHue}, 100%, 60%, 0.35)`;
  ctx.shadowBlur = mode === 'NEON_STRIP' ? 20 : 12;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(mesh.center[0].x, mesh.center[0].y);
  mesh.center.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.restore();
}

export function renderRibbonEffect(
  ctx: CanvasRenderingContext2D,
  histories: Map<string, RibbonSample[]>,
  hands: HandData[],
  time: number
) {
  const fingerHues = [0, 72, 144, 216, 288];
  histories.forEach((points, key) => {
    const keyParts = key.split(':');
    const fingerIndex = Number(keyParts[keyParts.length - 1] ?? 0);
    const mode: RibbonMode = key.includes('bridge') ? 'RAINBOW' : 'SILK';
    drawRibbonMesh(ctx, points, (fingerHues[fingerIndex % fingerHues.length] + time * 60) % 360, mode);
  });

  if (hands.length === 2) {
    const [a, b] = hands;
    for (let i = 0; i < a.fingertips.length; i += 1) {
      ctx.save();
      ctx.strokeStyle = `hsla(${(i * 72 + time * 80) % 360}, 100%, 70%, 0.35)`;
      ctx.lineWidth = Math.max(2, Math.hypot(a.fingertips[i].x - b.fingertips[i].x, a.fingertips[i].y - b.fingertips[i].y) / 40);
      ctx.beginPath();
      ctx.moveTo(a.fingertips[i].x, a.fingertips[i].y);
      ctx.quadraticCurveTo((a.center.x + b.center.x) / 2, (a.center.y + b.center.y) / 2 + Math.sin(time * 4 + i) * 24, b.fingertips[i].x, b.fingertips[i].y);
      ctx.stroke();
      ctx.restore();
    }
  }
}
