import { useCallback, useMemo, useRef, useState } from 'react';
import { DRAW_COLORS, DRAW_STYLES, DrawStyle, GESTURE_THRESHOLDS, HandData } from '@/lib/constants';
import { appendPoint, beginStroke, Stroke } from '@/lib/gestureWriter';

const gestureCooldownMs = 700;

export function useGestureWriter() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [styleIndex, setStyleIndex] = useState(0);
  const [status, setStatus] = useState<'DRAWING...' | 'PAUSED'>('PAUSED');
  const clearTimerRef = useRef<number | null>(null);
  const lastGestureRef = useRef<Record<string, number>>({});

  const color = DRAW_COLORS[colorIndex % DRAW_COLORS.length];
  const style = DRAW_STYLES[styleIndex % DRAW_STYLES.length] as DrawStyle;

  const canTrigger = (gesture: string) => {
    const now = performance.now();
    const last = lastGestureRef.current[gesture] ?? 0;
    if (now - last < gestureCooldownMs) return false;
    lastGestureRef.current[gesture] = now;
    return true;
  };

  const finalizeActiveStroke = useCallback(() => {
    const stroke = activeStrokeRef.current;
    if (!stroke || stroke.points.length < 2) return;
    setStrokes(prev => [...prev, { ...stroke, alpha: 1 }]);
    activeStrokeRef.current = null;
    setActiveStroke(null);
  }, []);

  const clear = useCallback(() => {
    activeStrokeRef.current = null;
    setStrokes([]);
    setActiveStroke(null);
  }, []);

  const undo = useCallback(() => {
    setStrokes(prev => prev.slice(0, -1));
  }, []);

  const cycleColor = useCallback(() => {
    setColorIndex(prev => (prev + 1) % DRAW_COLORS.length);
  }, []);

  const cycleStyle = useCallback(() => {
    setStyleIndex(prev => (prev + 1) % DRAW_STYLES.length);
  }, []);

  const updateFromHands = useCallback((hands: HandData[], drawEnabled: boolean) => {
    const hand = hands[0];
    if (!hand || !drawEnabled) {
      finalizeActiveStroke();
      setStatus('PAUSED');
      clearTimerRef.current = null;
      return;
    }

    const indexTip = hand.fingertips[1];
    const drawingActive = hand.pinchDistance < GESTURE_THRESHOLDS.pinchPx;
    const pressure = Math.max(0.3, 1 - Math.min(hand.pinchDistance, GESTURE_THRESHOLDS.pinchPx * 2) / (GESTURE_THRESHOLDS.pinchPx * 2));
    const point = { x: indexTip.x, y: indexTip.y, timestamp: performance.now(), pressure };

    if (hand.gesture === 'fist') {
      if (!clearTimerRef.current) clearTimerRef.current = performance.now();
      if (performance.now() - clearTimerRef.current >= GESTURE_THRESHOLDS.clearHoldMs) {
        clear();
        clearTimerRef.current = null;
      }
    } else {
      clearTimerRef.current = null;
    }

    if (hand.gesture === 'peace' && canTrigger('peace')) cycleColor();

    if (!drawingActive) {
      finalizeActiveStroke();
      setStatus('PAUSED');
      return;
    }

    setStatus('DRAWING...');
    setActiveStroke(previousState => {
      const stroke = previousState ?? beginStroke(color, 6, style, point);
      const clone = previousState
        ? { ...stroke, points: [...stroke.points], smoothedPoints: [...stroke.smoothedPoints], color, style, width: 6 }
        : stroke;
      if (previousState) appendPoint(clone, point);
      activeStrokeRef.current = clone;
      return clone;
    });
  }, [clear, color, cycleColor, finalizeActiveStroke, style]);

  const settledStrokes = useMemo(() => strokes.map((stroke, index) => ({ ...stroke, alpha: Math.max(0.24, 1 - index * 0.03) })), [strokes]);

  return {
    strokes: settledStrokes,
    activeStroke,
    color,
    style,
    status,
    clear,
    undo,
    cycleColor,
    cycleStyle,
    updateFromHands,
  };
}
