import { forwardRef, useEffect } from 'react';
import { Stroke, getSplineSegments } from '@/lib/gestureWriter';

interface Props {
  width: number;
  height: number;
  strokes: Stroke[];
  activeStroke: Stroke | null;
}

function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, animated = false) {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = stroke.color;
  ctx.shadowBlur = stroke.style === 'RIBBON' ? 24 : 16;
  ctx.globalAlpha = stroke.alpha;

  if (stroke.style === 'HOLOGRAM') {
    ctx.setLineDash([12, 8]);
    ctx.lineDashOffset = animated ? -(performance.now() / 16) : 0;
  }

  const segments = getSplineSegments(stroke.points);
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  segments.forEach(([p0, p1, p2, p3]) => {
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  });
  ctx.stroke();

  if (stroke.style === 'NEON') {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(1.5, stroke.width * 0.25);
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    stroke.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();
  }

  ctx.restore();
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, Props>(function DrawingCanvas({ width, height, strokes, activeStroke }, ref) {
  useEffect(() => {
    const canvas = typeof ref === 'function' ? null : ref?.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    strokes.forEach(stroke => renderStroke(ctx, stroke));
    if (activeStroke) renderStroke(ctx, activeStroke, true);
  }, [activeStroke, height, ref, strokes, width]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full holo-canvas pointer-events-none" style={{ zIndex: 4 }} />;
});

export default DrawingCanvas;
