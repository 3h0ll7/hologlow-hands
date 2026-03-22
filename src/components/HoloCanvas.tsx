import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import { updateRibbonHistory, RibbonSample } from '@/lib/ribbonGeometry';
import { useAudioReactive } from '@/hooks/useAudioReactive';
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

interface ViewportSize {
  width: number;
  height: number;
}

const getViewportSize = (): ViewportSize => ({
  width: typeof window === 'undefined' ? 1280 : window.innerWidth,
  height: typeof window === 'undefined' ? 720 : window.innerHeight,
});

export default function HoloCanvas({ mode, onStats }: Props) {
  const skelRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<HTMLCanvasElement>(null);
  const ribbonRef = useRef<Map<string, RibbonSample[]>>(new Map());
  const prevTwoHandDistanceRef = useRef(0);
  const { init, detect, ready } = useHandTracking();
  const { particles, emit, update } = useParticles();
  const { strokes, activeStroke, updateFromHands, statusRef, color, style, clear, undo, cycleColor, cycleStyle } = useGestureWriter();
  const { levelsRef, sample } = useAudioReactive(mode === 'audio');
  const videoElRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const fpsRef = useRef({ count: 0, last: performance.now(), value: 0 });
  const timeRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>(getViewportSize);

  const drawEnabled = useMemo(() => mode === 'draw' || mode === 'audio' || mode === 'ribbon', [mode]);

  const start = useCallback(async () => {
    if (videoElRef.current) {
      await init(videoElRef.current);
      setStarted(true);
    }
  }, [init]);

  useEffect(() => {
    const handleResize = () => setViewport(getViewportSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (window as Window & typeof globalThis & { __holoStart?: () => Promise<void> }).__holoStart = start;
    return () => {
      delete (window as Window & typeof globalThis & { __holoStart?: () => Promise<void> }).__holoStart;
    };
  }, [start]);

  useEffect(() => {
    const onCapture = () => saveScreenshot([skelRef.current, fxRef.current, drawingRef.current], videoElRef.current);
    window.addEventListener('holo:capture', onCapture);
    window.addEventListener('holo:clear', clear);
    window.addEventListener('holo:undo', undo);
    window.addEventListener('holo:color', cycleColor);
    window.addEventListener('holo:style', cycleStyle);
    return () => {
      window.removeEventListener('holo:capture', onCapture);
      window.removeEventListener('holo:clear', clear);
      window.removeEventListener('holo:undo', undo);
      window.removeEventListener('holo:color', cycleColor);
      window.removeEventListener('holo:style', cycleStyle);
    };
  }, [clear, cycleColor, cycleStyle, undo]);

  useEffect(() => {
    if (!ready || !started) return;
    let running = true;

    const loop = () => {
      if (!running) return;
      const skel = skelRef.current;
      const fx = fxRef.current;
      if (!skel || !fx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const { width: w, height: h } = getViewportSize();
      if (skel.width !== w || skel.height !== h) {
        skel.width = w;
        skel.height = h;
        fx.width = w;
        fx.height = h;
      }

      const skelCtx = skel.getContext('2d', { alpha: true, desynchronized: true });
      const fxCtx = fx.getContext('2d', { alpha: true, desynchronized: true });
      if (!skelCtx || !fxCtx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }
      skelCtx.clearRect(0, 0, w, h);
      fxCtx.clearRect(0, 0, w, h);

      timeRef.current = performance.now() / 1000;
      const t = timeRef.current;
      const hands = detect(w, h, fpsRef.current.value || 30);
      const audio = mode === 'audio' ? sample() : levelsRef.current;

      hands.forEach((hand, handIndex) => {
        drawSkeleton(skelCtx, hand.landmarks, w, h, mode === 'draw' && handIndex === 0);
        hand.fingertips.forEach((tip, fingerIndex) => {
          if (hand.velocity <= 5) return;
          const key = `${handIndex}:${fingerIndex}`;
          let history = ribbonRef.current.get(key);
          if (!history) {
            history = [];
            ribbonRef.current.set(key, history);
          }
          updateRibbonHistory(history, { x: tip.x, y: tip.y, timestamp: performance.now() });
        });
      });

      updateFromHands(hands, drawEnabled);

      if (hands.length > 0) {
        const effectMap: Record<EffectMode, () => void> = {
          prism: () => renderPrism(fxCtx, hands, t, emit),
          hex: () => renderHexGrid(fxCtx, hands, t),
          ring: () => renderHoloRing(fxCtx, hands, t),
          matrix: () => renderMatrix(fxCtx, hands, t),
          energy: () => renderEnergy(fxCtx, hands, t, emit),
          vortex: () => renderVortex(fxCtx, hands, t, emit),
          glass: () => renderGlass(fxCtx, hands, t),
          ribbon: () => renderRibbonEffect(fxCtx, ribbonRef.current, hands, t),
          draw: () => renderGlass(fxCtx, hands, t),
          audio: () => {
            fxCtx.save();
            fxCtx.globalAlpha = 0.8 + audio.bass * 0.2;
            renderGlass(fxCtx, hands, t + audio.mids * 2);
            renderRibbonEffect(fxCtx, ribbonRef.current, hands, t + audio.highs * 2);
            fxCtx.restore();
          },
        };
        effectMap[mode]();
        renderGestureEffects(fxCtx, hands, hands.map(hand => hand.gesture), t, emit);
      }

      const twoHandGesture = detectTwoHandGesture(hands, prevTwoHandDistanceRef.current);
      prevTwoHandDistanceRef.current = twoHandGesture.distance;
      if (twoHandGesture.gesture === 'portal') {
        fxCtx.save();
        fxCtx.strokeStyle = 'rgba(255,255,255,0.6)';
        fxCtx.lineWidth = 8;
        fxCtx.beginPath();
        fxCtx.arc(
          twoHandGesture.midpoint.x,
          twoHandGesture.midpoint.y,
          Math.max(20, twoHandGesture.distance * 0.18),
          0,
          Math.PI * 2
        );
        fxCtx.stroke();
        fxCtx.restore();
      }

      if (mode !== 'ribbon') {
        renderRibbonEffect(fxCtx, ribbonRef.current, hands, t);
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
        drawStatus: statusRef.current,
        twoHandGesture: twoHandGesture.gesture.toUpperCase(),
        audioLevel: Number(((audio.bass + audio.mids + audio.highs) / 3).toFixed(2)),
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [ready, started, mode, detect, emit, update, particles, onStats, updateFromHands, drawEnabled, sample, levelsRef, statusRef]);

  return (
    <>
      <video
        ref={videoElRef}
        className="absolute inset-0 w-full h-full object-cover holo-video"
        playsInline
        muted
      />
      <canvas ref={skelRef} className="absolute inset-0 w-full h-full holo-canvas will-change-transform" style={{ zIndex: 2 }} />
      <canvas ref={fxRef} className="absolute inset-0 w-full h-full holo-canvas will-change-transform" style={{ zIndex: 3 }} />
      <DrawingCanvas ref={drawingRef} width={viewport.width} height={viewport.height} strokes={strokes} activeStroke={activeStroke} />
      {mode === 'draw' && (
        <div className="absolute top-24 right-4 z-20 pointer-events-auto rounded-xl border border-cyan-400/30 bg-black/35 p-3 text-xs text-cyan-100 backdrop-blur-md">
          <div>
            COLOR <span className="ml-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: color }} />
          </div>
          <div className="mt-1">
            STYLE <span className="text-white/80">{style}</span>
          </div>
        </div>
      )}
    </>
  );
}
