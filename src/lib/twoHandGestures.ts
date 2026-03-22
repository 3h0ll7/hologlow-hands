import { HandData } from './constants';

export type TwoHandGestureName = 'none' | 'scale' | 'rotate' | 'portal' | 'clap' | 'frame';

export interface TwoHandGestureState {
  gesture: TwoHandGestureName;
  midpoint: { x: number; y: number };
  distance: number;
  angle: number;
  deltaDistance: number;
}

export function detectTwoHandGesture(hands: HandData[], prevDistance = 0): TwoHandGestureState {
  if (hands.length < 2) {
    return { gesture: 'none', midpoint: { x: 0, y: 0 }, distance: 0, angle: 0, deltaDistance: 0 };
  }

  const [a, b] = hands;
  const midpoint = { x: (a.center.x + b.center.x) / 2, y: (a.center.y + b.center.y) / 2 };
  const distance = Math.hypot(a.center.x - b.center.x, a.center.y - b.center.y);
  const angle = Math.atan2(b.center.y - a.center.y, b.center.x - a.center.x);
  const deltaDistance = distance - prevDistance;

  if (a.gesture === 'pinch' && b.gesture === 'pinch') return { gesture: 'portal', midpoint, distance, angle, deltaDistance };
  if (Math.abs(deltaDistance) > 20 && distance < 90) return { gesture: 'clap', midpoint, distance, angle, deltaDistance };
  if ((a.gesture === 'spread' || a.gesture === 'open_palm') && (b.gesture === 'spread' || b.gesture === 'open_palm')) {
    if (Math.abs(deltaDistance) > 5) return { gesture: 'scale', midpoint, distance, angle, deltaDistance };
    return { gesture: 'rotate', midpoint, distance, angle, deltaDistance };
  }
  if ((a.gesture === 'point' || a.gesture === 'thumbs_up') && (b.gesture === 'point' || b.gesture === 'thumbs_up')) {
    return { gesture: 'frame', midpoint, distance, angle, deltaDistance };
  }

  return { gesture: 'none', midpoint, distance, angle, deltaDistance };
}
