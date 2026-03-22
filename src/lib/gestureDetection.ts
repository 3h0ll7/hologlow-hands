import { Landmark } from './constants';
import { classifyGesture, GestureName } from './gestureClassifier';

export type Gesture = GestureName;

export function detectGesture(landmarks: Landmark[]): Gesture {
  return classifyGesture(landmarks, 1, 1).gesture;
}
