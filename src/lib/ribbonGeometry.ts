import { Point2D, RIBBON_CONFIG } from './constants';

export interface RibbonSample extends Point2D {
  timestamp: number;
}

export interface RibbonMesh {
  topEdge: Point2D[];
  bottomEdge: Point2D[];
  center: Point2D[];
}

export function updateRibbonHistory(history: RibbonSample[], point: RibbonSample) {
  history.push(point);
  if (history.length > RIBBON_CONFIG.maxHistory) {
    history.splice(0, history.length - RIBBON_CONFIG.maxHistory);
  }
}

export function buildRibbonMesh(points: RibbonSample[], maxWidth = RIBBON_CONFIG.maxWidth): RibbonMesh {
  if (points.length < 2) return { topEdge: [], bottomEdge: [], center: points };

  const topEdge: Point2D[] = [];
  const bottomEdge: Point2D[] = [];
  const total = points.length - 1;

  points.forEach((point, index) => {
    const next = points[Math.min(index + 1, points.length - 1)];
    const prev = points[Math.max(index - 1, 0)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / length;
    const ny = dx / length;
    const taper = Math.pow(1 - index / Math.max(total, 1), RIBBON_CONFIG.taperPower);
    const width = maxWidth * taper;
    topEdge.push({ x: point.x + nx * width * 0.5, y: point.y + ny * width * 0.5 });
    bottomEdge.push({ x: point.x - nx * width * 0.5, y: point.y - ny * width * 0.5 });
  });

  return { topEdge, bottomEdge, center: points };
}
