import { GESTURE_THRESHOLDS, Landmark } from './constants';

export type GestureName =
  | 'none'
  | 'pinch'
  | 'open_palm'
  | 'fist'
  | 'peace'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'point'
  | 'spread'
  | 'grab';

export interface GestureResult {
  gesture: GestureName;
  confidence: number;
  hand: 'left' | 'right';
  pinchDistance: number;
}

const FINGER_TIPS = [8, 12, 16, 20] as const;
const FINGER_MCPS = [5, 9, 13, 17] as const;

const distancePx = (a: Landmark, b: Landmark, width: number, height: number) =>
  Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);

const fingerExtended = (tip: Landmark, mcp: Landmark) => tip.y < mcp.y;

export function classifyGesture(
  landmarks: Landmark[],
  width: number,
  height: number,
  hand: 'left' | 'right' = 'right'
): GestureResult {
  if (landmarks.length < 21) {
    return { gesture: 'none', confidence: 0, hand, pinchDistance: Infinity };
  }

  const pinchDistance = distancePx(landmarks[4], landmarks[8], width, height);
  const extended = FINGER_TIPS.map((tipIndex, idx) => fingerExtended(landmarks[tipIndex], landmarks[FINGER_MCPS[idx]]));
  const thumbUp = landmarks[4].y < landmarks[2].y;
  const thumbDown = landmarks[4].y > landmarks[2].y;
  const allCurled = extended.every(v => !v) && Math.abs(landmarks[4].x - landmarks[2].x) < 0.15;
  const allExtended = extended.every(Boolean) && !thumbDown;
  const isPoint = extended[0] && !extended[1] && !extended[2] && !extended[3];
  const isPeace = extended[0] && extended[1] && !extended[2] && !extended[3];
  const spreadDistance = distancePx(landmarks[20], landmarks[4], width, height);

  if (pinchDistance < GESTURE_THRESHOLDS.pinchPx) {
    return { gesture: 'pinch', confidence: 0.98, hand, pinchDistance };
  }
  if (allCurled) {
    return { gesture: 'fist', confidence: 0.92, hand, pinchDistance };
  }
  if (thumbUp && !extended.some(Boolean)) {
    return { gesture: 'thumbs_up', confidence: 0.84, hand, pinchDistance };
  }
  if (thumbDown && !extended.some(Boolean)) {
    return { gesture: 'thumbs_down', confidence: 0.84, hand, pinchDistance };
  }
  if (isPeace) {
    return { gesture: 'peace', confidence: 0.88, hand, pinchDistance };
  }
  if (isPoint) {
    return { gesture: 'point', confidence: 0.86, hand, pinchDistance };
  }
  if (allExtended && spreadDistance > GESTURE_THRESHOLDS.spreadPx) {
    return { gesture: 'spread', confidence: 0.82, hand, pinchDistance };
  }
  if (allExtended) {
    return { gesture: 'open_palm', confidence: 0.85, hand, pinchDistance };
  }

  return { gesture: 'none', confidence: 0.35, hand, pinchDistance };
}
