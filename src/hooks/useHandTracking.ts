import { useRef, useCallback, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { FINGERTIP_INDICES, GESTURE_THRESHOLDS, HandData, Landmark, PALM_INDEX } from '@/lib/constants';
import { classifyGesture, GestureName } from '@/lib/gestureClassifier';

const EMA_ALPHA = 0.6;

type StableState = { candidate: GestureName; count: number; stable: GestureName };

function smoothLandmarks(previous: Landmark[] | undefined, next: Landmark[]) {
  if (!previous) return next;
  return next.map((landmark, index) => ({
    x: landmark.x * EMA_ALPHA + previous[index].x * (1 - EMA_ALPHA),
    y: landmark.y * EMA_ALPHA + previous[index].y * (1 - EMA_ALPHA),
    z: (landmark.z ?? 0) * EMA_ALPHA + previous[index].z * (1 - EMA_ALPHA),
  }));
}

function toHandData(
  landmarks: Landmark[],
  width: number,
  height: number,
  handedness: 'left' | 'right',
  stableState: StableState,
  lastCenter: { x: number; y: number } | undefined
): HandData {
  const sum = landmarks.reduce((acc, point) => ({ x: acc.x + point.x * width, y: acc.y + point.y * height }), { x: 0, y: 0 });
  const center = { x: sum.x / landmarks.length, y: sum.y / landmarks.length };
  const gestureResult = classifyGesture(landmarks, width, height, handedness);

  if (stableState.candidate === gestureResult.gesture) {
    stableState.count += 1;
  } else {
    stableState.candidate = gestureResult.gesture;
    stableState.count = 1;
  }

  if (stableState.count >= GESTURE_THRESHOLDS.stableFrames) {
    stableState.stable = stableState.candidate;
  }

  const velocity = lastCenter ? Math.hypot(center.x - lastCenter.x, center.y - lastCenter.y) : 0;

  return {
    landmarks,
    center,
    fingertips: FINGERTIP_INDICES.map(index => ({ x: landmarks[index].x * width, y: landmarks[index].y * height })),
    palmCenter: { x: landmarks[PALM_INDEX].x * width, y: landmarks[PALM_INDEX].y * height },
    gesture: stableState.stable,
    gestureConfidence: gestureResult.confidence,
    hand: handedness,
    pinchDistance: gestureResult.pinchDistance,
    velocity,
  };
}

function interpolateHandData(previous: HandData, next: HandData, t: number): HandData {
  return {
    ...next,
    landmarks: next.landmarks.map((landmark, index) => ({
      x: previous.landmarks[index].x + (landmark.x - previous.landmarks[index].x) * t,
      y: previous.landmarks[index].y + (landmark.y - previous.landmarks[index].y) * t,
      z: previous.landmarks[index].z + (landmark.z - previous.landmarks[index].z) * t,
    })),
    center: {
      x: previous.center.x + (next.center.x - previous.center.x) * t,
      y: previous.center.y + (next.center.y - previous.center.y) * t,
    },
    fingertips: next.fingertips.map((tip, index) => ({
      x: previous.fingertips[index].x + (tip.x - previous.fingertips[index].x) * t,
      y: previous.fingertips[index].y + (tip.y - previous.fingertips[index].y) * t,
    })),
    palmCenter: {
      x: previous.palmCenter.x + (next.palmCenter.x - previous.palmCenter.x) * t,
      y: previous.palmCenter.y + (next.palmCenter.y - previous.palmCenter.y) * t,
    },
    velocity: previous.velocity + (next.velocity - previous.velocity) * t,
  };
}

export function useHandTracking() {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const smoothedRef = useRef<Landmark[][]>([]);
  const stableGestureRef = useRef<StableState[]>([]);
  const lastCentersRef = useRef<Array<{ x: number; y: number }>>([]);
  const detectEveryRef = useRef(1);
  const frameRef = useRef(0);
  const previousDetectedRef = useRef<HandData[]>([]);
  const latestDetectedRef = useRef<HandData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [offscreenEnabled, setOffscreenEnabled] = useState(false);

  const init = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;
    setLoading(true);
    setError(null);
    setOffscreenEnabled(typeof OffscreenCanvas !== 'undefined');
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      video.srcObject = stream;
      await video.play();
      setReady(true);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission.');
      } else {
        setError(e.message || 'Failed to initialize hand tracking.');
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const detect = useCallback((width: number, height: number, fps = 30): HandData[] => {
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.readyState < 2) return [];

    detectEveryRef.current = fps < 20 ? 3 : fps < 30 ? 2 : 1;
    frameRef.current += 1;
    const shouldDetectNow = frameRef.current % detectEveryRef.current === 0 || latestDetectedRef.current.length === 0;

    if (shouldDetectNow) {
      const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      if (!results.landmarks?.length) {
        previousDetectedRef.current = latestDetectedRef.current;
        latestDetectedRef.current = [];
        return [];
      }

      previousDetectedRef.current = latestDetectedRef.current.length ? latestDetectedRef.current : previousDetectedRef.current;
      latestDetectedRef.current = results.landmarks.map((rawLandmarks, index) => {
        const stableState = stableGestureRef.current[index] ?? { candidate: 'none' as GestureName, count: 0, stable: 'none' as GestureName };
        const smoothed = smoothLandmarks(smoothedRef.current[index], rawLandmarks as Landmark[]);
        smoothedRef.current[index] = smoothed;

        const handedness = results.handednesses?.[index]?.[0]?.displayName?.toLowerCase() === 'left' ? 'left' : 'right';
        const hand = toHandData(smoothed, width, height, handedness, stableState, lastCentersRef.current[index]);
        stableGestureRef.current[index] = stableState;

        if ((previousDetectedRef.current[index]?.gesture ?? 'none') !== hand.gesture && hand.gesture !== 'none') {
          window.dispatchEvent(new CustomEvent('gesture', { detail: { ...hand, index } }));
        }

        lastCentersRef.current[index] = hand.center;
        return hand;
      });

      previousDetectedRef.current = previousDetectedRef.current.length ? previousDetectedRef.current : latestDetectedRef.current;
      return latestDetectedRef.current;
    }

    if (!latestDetectedRef.current.length) return [];
    const t = (frameRef.current % detectEveryRef.current) / detectEveryRef.current;

    return latestDetectedRef.current.map((hand, index) => {
      const previous = previousDetectedRef.current[index];
      return previous ? interpolateHandData(previous, hand, t) : hand;
    });
  }, []);

  return { init, detect, loading, error, ready, videoRef, offscreenEnabled };
}
