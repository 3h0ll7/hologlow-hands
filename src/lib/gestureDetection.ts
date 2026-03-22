export type Gesture = 'none' | 'pinch' | 'open_palm' | 'fist';

// Finger MCP (knuckle) and TIP indices
const FINGER_MCPS = [5, 9, 13, 17]; // index, middle, ring, pinky MCP
const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_PIPS = [6, 10, 14, 18]; // PIP joints

interface Landmark { x: number; y: number; z: number }

function dist(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function detectGesture(landmarks: Landmark[]): Gesture {
  if (landmarks.length < 21) return 'none';

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const wrist = landmarks[0];

  // Palm size reference (wrist to middle MCP)
  const palmSize = dist(wrist, landmarks[9]);
  if (palmSize < 0.001) return 'none';

  // Pinch: thumb tip close to index tip
  const pinchDist = dist(thumbTip, indexTip);
  if (pinchDist < palmSize * 0.25) {
    return 'pinch';
  }

  // Check how many fingers are extended
  // A finger is "curled" if tip is closer to wrist than PIP
  let curledCount = 0;
  let extendedCount = 0;
  for (let i = 0; i < 4; i++) {
    const tip = landmarks[FINGER_TIPS[i]];
    const pip = landmarks[FINGER_PIPS[i]];
    const tipDist = dist(tip, wrist);
    const pipDist = dist(pip, wrist);
    if (tipDist < pipDist * 1.05) {
      curledCount++;
    } else {
      extendedCount++;
    }
  }

  // Also check thumb
  const thumbIP = landmarks[3];
  const thumbTipDist = dist(thumbTip, wrist);
  const thumbIPDist = dist(thumbIP, wrist);
  if (thumbTipDist < thumbIPDist * 1.05) {
    curledCount++;
  } else {
    extendedCount++;
  }

  // Fist: all 5 fingers curled
  if (curledCount >= 4) return 'fist';

  // Open palm: all 5 fingers extended  
  if (extendedCount >= 4) return 'open_palm';

  return 'none';
}
