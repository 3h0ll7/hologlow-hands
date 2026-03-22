import { useCallback, useMemo, useRef, useState } from 'react';
import { DRAW_COLORS, DRAW_STYLES, DrawStyle, GESTURE_THRESHOLDS, HandData } from '@/lib/constants';
import { appendPoint, beginStroke, recognizeStrokeShape, Stroke } from '@/lib/gestureWriter';

const gestureCooldownMs = 700;

export function useGestureWriter() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
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

  const clear = useCallback(() => {
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
      if (activeStroke) {
        setStrokes(prev => [...prev, { ...activeStroke, alpha: 1 }]);
        setActiveStroke(null);
      }
      setStatus('PAUSED');
      return;
    }

    const indexTip = hand.fingertips[1];
    const drawingActive = hand.gesture === 'pinch' || hand.gesture === 'point';
    const pressure = Math.max(0.25, 1 - Math.min(hand.pinchDistance, GESTURE_THRESHOLDS.pinchPx) / GESTURE_THRESHOLDS.pinchPx);
    const point = { x: indexTip.x, y: indexTip.y, timestamp: performance.now(), pressure };

    if (hand.gesture === 'fist') {
      if (!clearTimerRef.current) clearTimerRef.current = performance.now();
      if (performance.now() - clearTimerRef.current >= GESTURE_THRESHOLDS.clearHoldMs) {
        clear();
      }
    } else {
      clearTimerRef.current = null;
    }

    if (hand.gesture === 'peace' && canTrigger('peace')) cycleColor();
    if (hand.gesture === 'thumbs_down' && canTrigger('thumbs_down')) undo();

    if (!drawingActive) {
      if (activeStroke) {
        const shape = recognizeStrokeShape(activeStroke.points);
        setStrokes(prev => [...prev, { ...activeStroke, style: shape === 'line' ? 'HOLOGRAM' : activeStroke.style }]);
        setActiveStroke(null);
      }
      setStatus('PAUSED');
      return;
    }

    setStatus('DRAWING...');
    setActiveStroke(prev => {
      if (!prev) return beginStroke(color, 4 + pressure * 10, style, point);
      const clone = { ...prev, points: [...prev.points], width: 4 + pressure * 10, color, style };
      appendPoint(clone, point);
      return clone;
    });
  }, [activeStroke, clear, color, cycleColor, style, undo]);

  const fadedStrokes = useMemo(() => strokes.map((stroke, index) => ({ ...stroke, alpha: Math.max(0.18, 1 - index * 0.04) })), [strokes]);

  return {
    strokes: fadedStrokes,
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
