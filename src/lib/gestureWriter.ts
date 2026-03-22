import { DrawStyle, Point2D } from './constants';

export interface StrokePoint extends Point2D {
  timestamp: number;
  pressure: number;
}

export interface Stroke {
  points: StrokePoint[];
  smoothedPoints: Point2D[];
  color: string;
  width: number;
  style: DrawStyle;
  timestamp: number;
  alpha: number;
}

export function catmullRomSpline(points: Point2D[], segments = 10): Point2D[] {
  if (points.length < 3) return points;

  const padded = [points[0], ...points, points[points.length - 1]];
  const smoothed: Point2D[] = [points[0]];

  for (let i = 0; i < padded.length - 3; i += 1) {
    const p0 = padded[i];
    const p1 = padded[i + 1];
    const p2 = padded[i + 2];
    const p3 = padded[i + 3];

    for (let step = 1; step <= segments; step += 1) {
      const t = step / segments;
      const t2 = t * t;
      const t3 = t2 * t;
      smoothed.push({
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }

  return smoothed;
}

export function beginStroke(color: string, width: number, style: DrawStyle, point: StrokePoint): Stroke {
  return {
    points: [point],
    smoothedPoints: [point],
    color,
    width,
    style,
    timestamp: point.timestamp,
    alpha: 1,
  };
}

export function appendPoint(stroke: Stroke, point: StrokePoint) {
  const last = stroke.points[stroke.points.length - 1];
  if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1.5) return;
  stroke.points.push(point);
  stroke.smoothedPoints = catmullRomSpline(stroke.points);
}

export function getRenderablePoints(stroke: Stroke) {
  return stroke.smoothedPoints.length > 1 ? stroke.smoothedPoints : stroke.points;
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
