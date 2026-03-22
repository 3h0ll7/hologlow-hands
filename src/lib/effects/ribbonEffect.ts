import { HandData, RIBBON_CONFIG } from '../constants';
import { buildRibbonMesh, RibbonSample } from '../ribbonGeometry';

const FINGER_HUES = [0, 72, 144, 216, 288] as const;

function drawRibbonMesh(
  ctx: CanvasRenderingContext2D,
  points: RibbonSample[],
  baseHue: number,
  rainbow = false
) {
  const mesh = buildRibbonMesh(points, RIBBON_CONFIG.maxWidth);
  if (mesh.topEdge.length < 2) return;

  const head = mesh.center[mesh.center.length - 1];
  const tail = mesh.center[0];
  const centerGradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
  centerGradient.addColorStop(0, `hsla(${baseHue}, 100%, 65%, 0)`);
  centerGradient.addColorStop(0.55, `hsla(${rainbow ? (baseHue + 90) % 360 : baseHue}, 100%, 72%, 0.45)`);
  centerGradient.addColorStop(1, `hsla(${rainbow ? (baseHue + 180) % 360 : baseHue}, 100%, 76%, 0.8)`);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(mesh.topEdge[0].x, mesh.topEdge[0].y);
  mesh.topEdge.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  mesh.bottomEdge.slice().reverse().forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();

  ctx.fillStyle = centerGradient;
  ctx.shadowColor = `hsla(${baseHue}, 100%, 65%, 0.35)`;
  ctx.shadowBlur = 18;
  ctx.fill();

  for (let i = 1; i < mesh.center.length; i += 1) {
    const prev = mesh.center[i - 1];
    const current = mesh.center[i];
    const alpha = current.alpha ?? 0.8;
    const segmentGradient = ctx.createLinearGradient(prev.x, prev.y, current.x, current.y);
    const hueA = rainbow ? (baseHue + i * 12) % 360 : baseHue;
    const hueB = rainbow ? (hueA + 48) % 360 : baseHue;
    segmentGradient.addColorStop(0, `hsla(${hueA}, 100%, 24%, ${alpha * 0.35})`);
    segmentGradient.addColorStop(0.5, `hsla(${hueB}, 100%, 75%, ${alpha})`);
    segmentGradient.addColorStop(1, `hsla(${hueA}, 100%, 24%, ${alpha * 0.35})`);
    ctx.strokeStyle = segmentGradient;
    ctx.lineWidth = Math.max(1, 10 * (1 - (i - 1) / mesh.center.length));
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBridgeRibbon(ctx: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }, hue: number, time: number) {
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 + Math.sin(time * 2 + hue) * 20;
  const steps = 14;
  const samples: RibbonSample[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const mt = 1 - t;
    samples.push({
      x: mt * mt * a.x + 2 * mt * t * midX + t * t * b.x,
      y: mt * mt * a.y + 2 * mt * t * midY + t * t * b.y,
      timestamp: performance.now(),
      alpha: 0.7 * (1 - t),
    });
  }

  drawRibbonMesh(ctx, samples, hue, true);
}

export function renderRibbonEffect(
  ctx: CanvasRenderingContext2D,
  histories: Map<string, RibbonSample[]>,
  hands: HandData[],
  time: number
) {
  histories.forEach((points, key) => {
    if (points.length < 2) return;
    const fingerIndex = Number(key.split(':')[1] ?? 0);
    drawRibbonMesh(ctx, points, FINGER_HUES[fingerIndex % FINGER_HUES.length]);
  });

  if (hands.length === 2) {
    const [a, b] = hands;
    for (let fingerIndex = 0; fingerIndex < a.fingertips.length; fingerIndex += 1) {
      drawBridgeRibbon(ctx, a.fingertips[fingerIndex], b.fingertips[fingerIndex], (FINGER_HUES[fingerIndex] + time * 80) % 360, time);
    }
  }
}
