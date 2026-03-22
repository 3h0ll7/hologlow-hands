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

  const strokesRef = useRef<Stroke[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const colorIndexRef = useRef(0);
  const styleIndexRef = useRef(0);
  const statusRef = useRef<'DRAWING...' | 'PAUSED'>('PAUSED');
  const clearTimerRef = useRef<number | null>(null);
  const lastGestureRef = useRef<Record<string, number>>({});

  const color = DRAW_COLORS[colorIndex % DRAW_COLORS.length];
  const style = DRAW_STYLES[styleIndex % DRAW_STYLES.length] as DrawStyle;

  const syncStatus = (next: 'DRAWING...' | 'PAUSED') => {
    if (statusRef.current !== next) {
      statusRef.current = next;
      setStatus(next);
    }
  };

  const canTrigger = (gesture: string) => {
    const now = performance.now();
    const last = lastGestureRef.current[gesture] ?? 0;
    if (now - last < gestureCooldownMs) return false;
    lastGestureRef.current[gesture] = now;
    return true;
  };

  const commitActiveStroke = useCallback((override?: Partial<Stroke>) => {
    if (!activeStrokeRef.current) return;
    const committed = { ...activeStrokeRef.current, ...override };
    const nextStrokes = [...strokesRef.current, committed];
    strokesRef.current = nextStrokes;
    activeStrokeRef.current = null;
    setStrokes(nextStrokes);
    setActiveStroke(null);
  }, []);

  const clear = useCallback(() => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokes([]);
    setActiveStroke(null);
    syncStatus('PAUSED');
  }, []);

  const undo = useCallback(() => {
    const next = strokesRef.current.slice(0, -1);
    strokesRef.current = next;
    setStrokes(next);
  }, []);

  const cycleColor = useCallback(() => {
    colorIndexRef.current = (colorIndexRef.current + 1) % DRAW_COLORS.length;
    setColorIndex(colorIndexRef.current);
  }, []);

  const cycleStyle = useCallback(() => {
    styleIndexRef.current = (styleIndexRef.current + 1) % DRAW_STYLES.length;
    setStyleIndex(styleIndexRef.current);
  }, []);

  const updateFromHands = useCallback((hands: HandData[], drawEnabled: boolean) => {
    const hand = hands[0];
    if (!hand || !drawEnabled) {
      commitActiveStroke();
      syncStatus('PAUSED');
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
      const currentStroke = activeStrokeRef.current;
      if (currentStroke) {
        const shape = recognizeStrokeShape(currentStroke.points);
        commitActiveStroke({ style: shape === 'line' ? 'HOLOGRAM' : currentStroke.style });
      }
      syncStatus('PAUSED');
      return;
    }

    syncStatus('DRAWING...');
    if (!activeStrokeRef.current) {
      const created = beginStroke(
        DRAW_COLORS[colorIndexRef.current % DRAW_COLORS.length],
        4 + pressure * 10,
        DRAW_STYLES[styleIndexRef.current % DRAW_STYLES.length] as DrawStyle,
        point
      );
      activeStrokeRef.current = created;
      setActiveStroke(created);
      return;
    }

    const nextStroke: Stroke = {
      ...activeStrokeRef.current,
      points: [...activeStrokeRef.current.points],
      width: 4 + pressure * 10,
      color: DRAW_COLORS[colorIndexRef.current % DRAW_COLORS.length],
      style: DRAW_STYLES[styleIndexRef.current % DRAW_STYLES.length] as DrawStyle,
    };
    appendPoint(nextStroke, point);
    activeStrokeRef.current = nextStroke;
    setActiveStroke(nextStroke);
  }, [clear, commitActiveStroke, cycleColor, undo]);

  const fadedStrokes = useMemo(
    () => strokes.map((stroke, index) => ({ ...stroke, alpha: Math.max(0.18, 1 - index * 0.04) })),
    [strokes]
  );

  return {
    strokes: fadedStrokes,
    activeStroke,
    color,
    style,
    status,
    statusRef,
    clear,
    undo,
    cycleColor,
    cycleStyle,
    updateFromHands,
  };
}
