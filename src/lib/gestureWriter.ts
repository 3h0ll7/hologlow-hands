import { DrawStyle, Point2D } from './constants';

export interface StrokePoint extends Point2D {
  timestamp: number;
  pressure: number;
}

export interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
  style: DrawStyle;
  timestamp: number;
  alpha: number;
}

export function beginStroke(color: string, width: number, style: DrawStyle, point: StrokePoint): Stroke {
  return {
    points: [point],
    color,
    width,
    style,
    timestamp: point.timestamp,
    alpha: 1,
  };
}

export function appendPoint(stroke: Stroke, point: StrokePoint) {
  const next = stroke.points.length > 500 ? stroke.points.length % 2 === 0 : true;
  if (next) stroke.points.push(point);
}

export function strokeBounds(points: StrokePoint[]) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

export function recognizeStrokeShape(points: StrokePoint[]): 'circle' | 'line' | 'triangle' | 'hexagon' | null {
  if (points.length < 10) return null;
  const start = points[0];
  const end = points[points.length - 1];
  const bounds = strokeBounds(points);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const closure = Math.hypot(start.x - end.x, start.y - end.y);
  if (closure < Math.max(width, height) * 0.2 && Math.abs(width - height) < Math.max(width, height) * 0.3) return 'circle';
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const maxDeviation = Math.max(...points.map(point => Math.abs((dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / len)));
  if (maxDeviation < 12) return 'line';
  return null;
}

export function getSplineSegments(points: StrokePoint[]) {
  if (points.length < 2) return [] as Array<[StrokePoint, StrokePoint, StrokePoint, StrokePoint]>;
  const padded = [points[0], ...points, points[points.length - 1]];
  const segments: Array<[StrokePoint, StrokePoint, StrokePoint, StrokePoint]> = [];
  for (let i = 0; i < padded.length - 3; i += 1) {
    segments.push([padded[i], padded[i + 1], padded[i + 2], padded[i + 3]]);
  }
  return segments;
}
