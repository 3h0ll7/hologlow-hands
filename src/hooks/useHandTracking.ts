import { useRef, useCallback, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FINGERTIP_INDICES, PALM_INDEX, HandData } from '@/lib/constants';

export function useHandTracking() {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const init = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const detect = useCallback((w: number, h: number): HandData[] => {
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.readyState < 2) return [];
    const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
    if (!results.landmarks?.length) return [];

    return results.landmarks.map(lms => {
      const avg = lms.reduce(
        (a, l) => ({ x: a.x + l.x * w, y: a.y + l.y * h }),
        { x: 0, y: 0 }
      );
      return {
        landmarks: lms.map(l => ({ x: l.x, y: l.y, z: l.z })),
        center: { x: avg.x / 21, y: avg.y / 21 },
        fingertips: FINGERTIP_INDICES.map(i => ({ x: lms[i].x * w, y: lms[i].y * h })),
        palmCenter: { x: lms[PALM_INDEX].x * w, y: lms[PALM_INDEX].y * h },
      };
    });
  }, []);

  return { init, detect, loading, error, ready, videoRef };
}
