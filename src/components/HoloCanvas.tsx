import { useEffect, useRef, useState, useCallback } from 'react';
import { EffectMode, EFFECT_MODES, HandData } from '@/lib/constants';
import { Gesture } from '@/lib/gestureDetection';
import { drawSkeleton, drawParticles } from '@/lib/drawingUtils';
import { renderPrism } from '@/lib/effects/prismEffect';
import { renderHexGrid } from '@/lib/effects/hexGridEffect';
import { renderHoloRing } from '@/lib/effects/holoRingEffect';
import { renderMatrix } from '@/lib/effects/matrixEffect';
import { renderEnergy } from '@/lib/effects/energyEffect';
import { renderVortex } from '@/lib/effects/vortexEffect';
import { renderGestureEffects } from '@/lib/effects/gestureEffects';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useParticles } from '@/hooks/useParticles';

interface Props {
  mode: EffectMode;
  onStats: (hands: number, fps: number, gestures: Gesture[]) => void;
}

export default function HoloCanvas({ mode, onStats }: Props) {
  const skelRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const { init, detect, ready, loading, error, videoRef } = useHandTracking();
  const { particles, emit, update } = useParticles();
  const videoElRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const fpsRef = useRef({ count: 0, last: performance.now(), value: 0 });
  const timeRef = useRef(0);
  const [started, setStarted] = useState(false);

  const start = useCallback(async () => {
    if (videoElRef.current) {
      await init(videoElRef.current);
      setStarted(true);
    }
  }, [init]);

  // Expose start
  useEffect(() => {
    (window as any).__holoStart = start;
    return () => { delete (window as any).__holoStart; };
  }, [start]);

  useEffect(() => {
    if (!ready) return;
    let running = true;

    const loop = () => {
      if (!running) return;
      const skel = skelRef.current;
      const fx = fxRef.current;
      if (!skel || !fx) { frameRef.current = requestAnimationFrame(loop); return; }

      const w = window.innerWidth, h = window.innerHeight;
      if (skel.width !== w || skel.height !== h) {
        skel.width = w; skel.height = h;
        fx.width = w; fx.height = h;
      }

      const skelCtx = skel.getContext('2d')!;
      const fxCtx = fx.getContext('2d')!;
      skelCtx.clearRect(0, 0, w, h);
      fxCtx.clearRect(0, 0, w, h);

      const hands = detect(w, h);
      timeRef.current = performance.now() / 1000;
      const t = timeRef.current;

      // Draw skeletons
      for (const hand of hands) {
        drawSkeleton(skelCtx, hand.landmarks, w, h);
      }

      // Draw effects
      if (hands.length > 0) {
        const effectMap: Record<EffectMode, () => void> = {
          prism: () => renderPrism(fxCtx, hands, t, emit),
          hex_grid: () => renderHexGrid(fxCtx, hands, t),
          holo_ring: () => renderHoloRing(fxCtx, hands, t),
          matrix: () => renderMatrix(fxCtx, hands, t),
          energy: () => renderEnergy(fxCtx, hands, t, emit),
          vortex: () => renderVortex(fxCtx, hands, t, emit),
        };
        effectMap[mode]();

        // Gesture effects overlay
        const gestureList = hands.map(h => h.gesture);
        renderGestureEffects(fxCtx, hands, gestureList, t, emit);
      }

      // Particles
      update();
      drawParticles(fxCtx, particles);

      // FPS
      fpsRef.current.count++;
      const now = performance.now();
      if (now - fpsRef.current.last >= 1000) {
        fpsRef.current.value = fpsRef.current.count;
        fpsRef.current.count = 0;
        fpsRef.current.last = now;
      }
      onStats(hands.length, fpsRef.current.value, hands.map(h => h.gesture));

      frameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, [ready, mode, detect, emit, update, particles, onStats]);

  return (
    <>
      <video
        ref={videoElRef}
        className="absolute inset-0 w-full h-full object-cover holo-video"
        playsInline
        muted
      />
      <canvas ref={skelRef} className="absolute inset-0 w-full h-full holo-canvas" style={{ zIndex: 2 }} />
      <canvas ref={fxRef} className="absolute inset-0 w-full h-full holo-canvas" style={{ zIndex: 3 }} />
    </>
  );
}
