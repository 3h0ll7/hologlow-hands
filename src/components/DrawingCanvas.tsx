import { forwardRef, useEffect, useRef } from 'react';
import { getRenderablePoints, Stroke } from '@/lib/gestureWriter';

interface Props {
  width: number;
  height: number;
  strokes: Stroke[];
  activeStroke: Stroke | null;
}

function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const points = getRenderablePoints(stroke);
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = stroke.alpha;

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = 6;
  ctx.shadowColor = stroke.color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.96)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.restore();
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, Props>(function DrawingCanvas({ width, height, strokes, activeStroke }, ref) {
  const committedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousStrokeCountRef = useRef(0);
  const previousWidthRef = useRef(0);
  const previousHeightRef = useRef(0);

  useEffect(() => {
    if (!committedCanvasRef.current) {
      committedCanvasRef.current = document.createElement('canvas');
    }

    const canvas = typeof ref === 'function' ? null : ref?.current;
    const committedCanvas = committedCanvasRef.current;
    if (!canvas || !committedCanvas) return;

    const sizeChanged = previousWidthRef.current !== width || previousHeightRef.current !== height;
    canvas.width = width;
    canvas.height = height;

    if (sizeChanged) {
      committedCanvas.width = width;
      committedCanvas.height = height;
      previousWidthRef.current = width;
      previousHeightRef.current = height;
      previousStrokeCountRef.current = 0;
    }

    const committedCtx = committedCanvas.getContext('2d');
    const ctx = canvas.getContext('2d');
    if (!ctx || !committedCtx) return;

    if (sizeChanged || strokes.length < previousStrokeCountRef.current) {
      committedCtx.clearRect(0, 0, width, height);
      strokes.forEach(stroke => renderStroke(committedCtx, stroke));
      previousStrokeCountRef.current = strokes.length;
    } else if (strokes.length > previousStrokeCountRef.current) {
      strokes.slice(previousStrokeCountRef.current).forEach(stroke => renderStroke(committedCtx, stroke));
      previousStrokeCountRef.current = strokes.length;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(committedCanvas, 0, 0, width, height);
    if (activeStroke) renderStroke(ctx, activeStroke);
  }, [activeStroke, height, ref, strokes, width]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-none holo-canvas" style={{ zIndex: 4 }} />;
});

export default DrawingCanvas;
