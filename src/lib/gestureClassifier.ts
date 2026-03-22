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
const FINGER_PIPS = [6, 10, 14, 18] as const;
const FINGER_MCPS = [5, 9, 13, 17] as const;

const distancePx = (a: Landmark, b: Landmark, width: number, height: number) =>
  Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);

const extendedFinger = (tip: Landmark, pip: Landmark, mcp: Landmark) => tip.y < pip.y && pip.y < mcp.y;

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
  const extended = FINGER_TIPS.map((tipIndex, index) =>
    extendedFinger(landmarks[tipIndex], landmarks[FINGER_PIPS[index]], landmarks[FINGER_MCPS[index]])
  );
  const thumbLift = landmarks[2].y - landmarks[4].y;
  const thumbDrop = landmarks[4].y - landmarks[2].y;
  const thumbAcrossPalm = Math.abs(landmarks[4].x - landmarks[2].x) < 0.12;
  const spreadDistance = distancePx(landmarks[20], landmarks[4], width, height);
  const curledCount = extended.filter(value => !value).length;
  const allExtended = extended.every(Boolean);
  const indexOnly = extended[0] && !extended[1] && !extended[2] && !extended[3];
  const peace = extended[0] && extended[1] && !extended[2] && !extended[3];

  if (pinchDistance < GESTURE_THRESHOLDS.pinchPx) {
    return { gesture: 'pinch', confidence: 0.98, hand, pinchDistance };
  }

  if (curledCount === 4 && thumbAcrossPalm) {
    if (thumbLift > GESTURE_THRESHOLDS.thumbsUpVerticalLift) {
      return { gesture: 'thumbs_up', confidence: 0.9, hand, pinchDistance };
    }
    if (thumbDrop > GESTURE_THRESHOLDS.thumbsUpVerticalLift) {
      return { gesture: 'thumbs_down', confidence: 0.88, hand, pinchDistance };
    }
    return { gesture: 'fist', confidence: 0.92, hand, pinchDistance };
  }

  if (peace) {
    return { gesture: 'peace', confidence: 0.9, hand, pinchDistance };
  }

  if (indexOnly) {
    return { gesture: 'point', confidence: 0.86, hand, pinchDistance };
  }

  if (allExtended && spreadDistance > GESTURE_THRESHOLDS.spreadPx) {
    return { gesture: 'spread', confidence: 0.86, hand, pinchDistance };
  }

  if (allExtended) {
    return { gesture: 'open_palm', confidence: 0.84, hand, pinchDistance };
  }

  if (curledCount >= 3) {
    return { gesture: 'grab', confidence: 0.72, hand, pinchDistance };
  }

  return { gesture: 'none', confidence: 0.35, hand, pinchDistance };
}
