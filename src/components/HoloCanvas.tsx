import { useEffect, useRef, useState, useCallback } from 'react';
import { EffectMode } from '@/lib/constants';
import { GestureName } from '@/lib/gestureClassifier';
import { drawParticles, drawSkeleton } from '@/lib/drawingUtils';
import { renderPrism } from '@/lib/effects/prismEffect';
import { renderHexGrid } from '@/lib/effects/hexGridEffect';
import { renderHoloRing } from '@/lib/effects/holoRingEffect';
import { renderMatrix } from '@/lib/effects/matrixEffect';
import { renderEnergy } from '@/lib/effects/energyEffect';
import { renderVortex } from '@/lib/effects/vortexEffect';
import { renderGestureEffects } from '@/lib/effects/gestureEffects';
import { renderGlass } from '@/lib/effects/glassEffect';
import { renderRibbonEffect } from '@/lib/effects/ribbonEffect';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useParticles } from '@/hooks/useParticles';
import { useGestureWriter } from '@/hooks/useGestureWriter';
import { dissolveRibbonHistory, RibbonSample, updateRibbonHistory } from '@/lib/ribbonGeometry';
import { detectTwoHandGesture } from '@/lib/twoHandGestures';
import DrawingCanvas from './DrawingCanvas';
import { saveScreenshot } from '@/lib/captureUtils';

interface StatsPayload {
  hands: number;
  fps: number;
  gestures: GestureName[];
  handLabels: string[];
  drawStatus: 'DRAWING...' | 'PAUSED';
  twoHandGesture: string;
  audioLevel: number;
}

interface Props {
  mode: EffectMode;
  onStats: (stats: StatsPayload) => void;
}

const TRANSITION_MS = 300;
const SCREENSHOT_COOLDOWN_MS = 1200;

export default function HoloCanvas({ mode, onStats }: Props) {
  const skelRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<HTMLCanvasElement>(null);
  const ribbonRef = useRef<Map<string, RibbonSample[]>>(new Map());
  const prevTwoHandDistanceRef = useRef(0);
  const previousModeRef = useRef<EffectMode | null>(null);
  const currentModeRef = useRef<EffectMode>(mode);
  const screenshotCooldownRef = useRef(0);
  const { init, detect, ready } = useHandTracking();
  const { particles, emit, update } = useParticles();
  const { strokes, activeStroke, updateFromHands, status, color, clear, undo, cycleColor } = useGestureWriter();
  const videoElRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const fpsRef = useRef({ count: 0, last: performance.now(), value: 0 });
  const timeRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [transitionStart, setTransitionStart] = useState<number | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);

  const start = useCallback(async () => {
    if (videoElRef.current) {
      await init(videoElRef.current);
      setStarted(true);
    }
  }, [init]);

  const triggerCapture = useCallback(async () => {
    const now = performance.now();
    if (now - screenshotCooldownRef.current < SCREENSHOT_COOLDOWN_MS) return;
    screenshotCooldownRef.current = now;
    await saveScreenshot([skelRef.current, fxRef.current, drawingRef.current], videoElRef.current);
  }, []);

  useEffect(() => {
    (window as Window & typeof globalThis & { __holoStart?: () => Promise<void> }).__holoStart = start;
    return () => {
      delete (window as Window & typeof globalThis & { __holoStart?: () => Promise<void> }).__holoStart;
    };
  }, [start]);

  useEffect(() => {
    const onCapture = () => { void triggerCapture(); };
    const onClear = () => clear();
    const onUndo = () => undo();
    const onColor = () => cycleColor();
    const onFlash = () => {
      setFlashVisible(true);
      window.setTimeout(() => setFlashVisible(false), 300);
    };

    window.addEventListener('holo:capture', onCapture);
    window.addEventListener('holo:clear', onClear);
    window.addEventListener('holo:undo', onUndo);
    window.addEventListener('holo:color', onColor);
    window.addEventListener('holo:flash', onFlash);
    return () => {
      window.removeEventListener('holo:capture', onCapture);
      window.removeEventListener('holo:clear', onClear);
      window.removeEventListener('holo:undo', onUndo);
      window.removeEventListener('holo:color', onColor);
      window.removeEventListener('holo:flash', onFlash);
    };
  }, [clear, cycleColor, triggerCapture, undo]);

  useEffect(() => {
    if (mode !== currentModeRef.current) {
      previousModeRef.current = currentModeRef.current;
      currentModeRef.current = mode;
      setTransitionStart(performance.now());
    }
  }, [mode]);

  useEffect(() => {
    if (!ready || !started) return;
    let running = true;

    const renderMode = (
      ctx: CanvasRenderingContext2D,
      renderModeValue: EffectMode,
      hands: ReturnType<typeof detect>,
      time: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const effectMap: Record<EffectMode, () => void> = {
        prism: () => renderPrism(ctx, hands, time, emit),
        hex: () => renderHexGrid(ctx, hands, time),
        ring: () => renderHoloRing(ctx, hands, time),
        matrix: () => renderMatrix(ctx, hands, time),
        energy: () => renderEnergy(ctx, hands, time, emit),
        vortex: () => renderVortex(ctx, hands, time, emit),
        glass: () => renderGlass(ctx, hands, time),
        ribbon: () => renderRibbonEffect(ctx, ribbonRef.current, hands, time),
        draw: () => renderGlass(ctx, hands, time),
      };
      effectMap[renderModeValue]();
      ctx.restore();
    };

    const loop = () => {
      if (!running) return;
      const skel = skelRef.current;
      const fx = fxRef.current;
      if (!skel || !fx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      if (skel.width !== width || skel.height !== height) {
        skel.width = width;
        skel.height = height;
        fx.width = width;
        fx.height = height;
      }

      const skelCtx = skel.getContext('2d', { alpha: true, desynchronized: true });
      const fxCtx = fx.getContext('2d', { alpha: true, desynchronized: true });
      if (!skelCtx || !fxCtx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      skelCtx.clearRect(0, 0, width, height);
      fxCtx.clearRect(0, 0, width, height);

      timeRef.current = performance.now() / 1000;
      const time = timeRef.current;
      const hands = detect(width, height, fpsRef.current.value || 30);

      hands.forEach((hand, handIndex) => {
        drawSkeleton(skelCtx, hand.landmarks, width, height, mode === 'draw' && handIndex === 0);
        hand.fingertips.forEach((tip, fingerIndex) => {
          const key = `${handIndex}:${fingerIndex}`;
          const history = ribbonRef.current.get(key) ?? [];
          const previousTip = history[history.length - 1];
          const fingertipVelocity = previousTip ? Math.hypot(tip.x - previousTip.x, tip.y - previousTip.y) : hand.velocity;

          if (fingertipVelocity > 5) {
            updateRibbonHistory(history, { x: tip.x, y: tip.y, timestamp: performance.now(), alpha: 0.8 });
            ribbonRef.current.set(key, history);
          } else {
            dissolveRibbonHistory(history);
            if (history.length) ribbonRef.current.set(key, history);
          }
        });
      });

      updateFromHands(hands, mode === 'draw');

      const transitionProgress = transitionStart ? Math.min(1, (performance.now() - transitionStart) / TRANSITION_MS) : 1;
      const previousAlpha = transitionStart && transitionProgress < 1 ? 1 - transitionProgress : 0;
      const nextAlpha = transitionStart && transitionProgress < 1 ? transitionProgress : 1;

      if (hands.length > 0) {
        if (previousAlpha > 0 && previousModeRef.current) {
          renderMode(fxCtx, previousModeRef.current, hands, time, previousAlpha);
        }
        renderMode(fxCtx, mode, hands, time, nextAlpha);
        renderGestureEffects(fxCtx, hands, hands.map(hand => hand.gesture), time, emit);
      }

      if (transitionStart && transitionProgress >= 1) {
        previousModeRef.current = null;
        setTransitionStart(null);
      }

      const twoHandGesture = detectTwoHandGesture(hands, prevTwoHandDistanceRef.current);
      prevTwoHandDistanceRef.current = twoHandGesture.distance;

      if (twoHandGesture.gesture === 'portal') {
        fxCtx.save();
        fxCtx.strokeStyle = 'rgba(255,255,255,0.6)';
        fxCtx.lineWidth = 8;
        fxCtx.beginPath();
        fxCtx.arc(twoHandGesture.midpoint.x, twoHandGesture.midpoint.y, Math.max(20, twoHandGesture.distance * 0.18), 0, Math.PI * 2);
        fxCtx.stroke();
        fxCtx.restore();
      }

      if (mode !== 'ribbon') {
        renderRibbonEffect(fxCtx, ribbonRef.current, hands, time);
      }

      if (hands.some(hand => hand.gesture === 'thumbs_up')) {
        void triggerCapture();
      }

      update();
      drawParticles(fxCtx, particles);

      fpsRef.current.count += 1;
      const now = performance.now();
      if (now - fpsRef.current.last >= 1000) {
        fpsRef.current.value = fpsRef.current.count;
        fpsRef.current.count = 0;
        fpsRef.current.last = now;
      }

      onStats({
        hands: hands.length,
        fps: fpsRef.current.value,
        gestures: hands.map(hand => hand.gesture),
        handLabels: hands.map(hand => hand.hand.toUpperCase()),
        drawStatus: status,
        twoHandGesture: twoHandGesture.gesture.toUpperCase(),
        audioLevel: 0,
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [ready, started, mode, detect, emit, onStats, particles, status, transitionStart, triggerCapture, update, updateFromHands]);

  return (
    <>
      <video
        ref={videoElRef}
        className="absolute inset-0 h-full w-full object-cover holo-video"
        playsInline
        muted
      />
      <canvas ref={skelRef} className="absolute inset-0 h-full w-full holo-canvas will-change-transform" style={{ zIndex: 2 }} />
      <canvas ref={fxRef} className="absolute inset-0 h-full w-full holo-canvas will-change-transform" style={{ zIndex: 3 }} />
      <DrawingCanvas ref={drawingRef} width={window.innerWidth} height={window.innerHeight} strokes={strokes} activeStroke={activeStroke} />
      {mode === 'draw' && (
        <div className="absolute right-4 top-24 z-20 rounded-xl border border-cyan-400/30 bg-black/35 p-3 text-xs text-cyan-100 backdrop-blur-md">
          <div>
            COLOR
            <span className="ml-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: color }} />
          </div>
          <div className="mt-1">PINCH TO DRAW • PEACE TO SHIFT • HOLD FIST TO CLEAR</div>
        </div>
      )}
      <div
        className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-300 ${flashVisible ? 'opacity-80' : 'opacity-0'}`}
        style={{ zIndex: 40 }}
      />
    </>
  );
}
