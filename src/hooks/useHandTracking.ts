import { useRef, useCallback, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { FINGERTIP_INDICES, GESTURE_THRESHOLDS, HandData, Landmark, PALM_INDEX } from '@/lib/constants';
import { classifyGesture, GestureName } from '@/lib/gestureClassifier';

const EMA_ALPHA = 0.6;

export function useHandTracking() {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const smoothedRef = useRef<Landmark[][]>([]);
  const stableGestureRef = useRef<Array<{ candidate: GestureName; count: number; stable: GestureName }>>([]);
  const lastCentersRef = useRef<Array<{ x: number; y: number }>>([]);
  const detectEveryRef = useRef(1);
  const frameRef = useRef(0);
  const lastResultsRef = useRef<HandData[]>([]);
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

  const detect = useCallback((w: number, h: number, fps = 30): HandData[] => {
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.readyState < 2) return [];

    detectEveryRef.current = fps < 20 ? 3 : fps < 30 ? 2 : 1;
    frameRef.current += 1;

    if (frameRef.current % detectEveryRef.current !== 0 && lastResultsRef.current.length) {
      return lastResultsRef.current;
    }

    const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
    if (!results.landmarks?.length) {
      lastResultsRef.current = [];
      return [];
    }

    const nextHands = results.landmarks.map((lms, index) => {
      const previous = smoothedRef.current[index] ?? lms;
      const smoothed = lms.map((lm, lmIndex) => ({
        x: previous[lmIndex].x + (lm.x - previous[lmIndex].x) * EMA_ALPHA,
        y: previous[lmIndex].y + (lm.y - previous[lmIndex].y) * EMA_ALPHA,
        z: previous[lmIndex].z + ((lm.z ?? 0) - previous[lmIndex].z) * EMA_ALPHA,
      }));
      smoothedRef.current[index] = smoothed;

      const avg = smoothed.reduce((a, l) => ({ x: a.x + l.x * w, y: a.y + l.y * h }), { x: 0, y: 0 });
      const center = { x: avg.x / 21, y: avg.y / 21 };
      const handedness = results.handednesses?.[index]?.[0]?.displayName?.toLowerCase() === 'left' ? 'left' : 'right';
      const gestureResult = classifyGesture(smoothed, w, h, handedness);
      const stableState = stableGestureRef.current[index] ?? { candidate: 'none' as GestureName, count: 0, stable: 'none' as GestureName };
      if (stableState.candidate === gestureResult.gesture) {
        stableState.count += 1;
      } else {
        stableState.candidate = gestureResult.gesture;
        stableState.count = 1;
      }
      if (stableState.count >= GESTURE_THRESHOLDS.stableFrames && stableState.stable !== gestureResult.gesture) {
        stableState.stable = gestureResult.gesture;
        window.dispatchEvent(new CustomEvent('gesture', { detail: gestureResult }));
      }
      stableGestureRef.current[index] = stableState;

      const previousCenter = lastCentersRef.current[index] ?? center;
      const velocity = Math.hypot(center.x - previousCenter.x, center.y - previousCenter.y);
      lastCentersRef.current[index] = center;

      return {
        landmarks: smoothed,
        center,
        fingertips: FINGERTIP_INDICES.map(i => ({ x: smoothed[i].x * w, y: smoothed[i].y * h })),
        palmCenter: { x: smoothed[PALM_INDEX].x * w, y: smoothed[PALM_INDEX].y * h },
        gesture: stableState.stable,
        gestureConfidence: gestureResult.confidence,
        hand: handedness,
        pinchDistance: gestureResult.pinchDistance,
        velocity,
      } satisfies HandData;
    });

    lastResultsRef.current = nextHands;
    return nextHands;
  }, []);

  return { init, detect, loading, error, ready, videoRef, offscreenEnabled };
}
