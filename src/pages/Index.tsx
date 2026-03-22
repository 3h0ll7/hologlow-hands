import { useState, useCallback } from 'react';
import StartScreen from '@/components/StartScreen';
import HoloCanvas from '@/components/HoloCanvas';
import HUD from '@/components/HUD';
import { EffectMode } from '@/lib/constants';
import { Gesture } from '@/lib/gestureDetection';

export default function Index() {
  const [phase, setPhase] = useState<'start' | 'loading' | 'active'>('start');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<EffectMode>('prism');
  const [stats, setStats] = useState({ hands: 0, fps: 0, gestures: [] as Gesture[] });

  const handleActivate = useCallback(() => {
    setPhase('loading');
    setError(null);
    setTimeout(async () => {
      try {
        await (window as any).__holoStart?.();
        setPhase('active');
      } catch (e: any) {
        setError(e.message || 'Failed to start');
        setPhase('start');
      }
    }, 200);
  }, []);

  const handleStats = useCallback((hands: number, fps: number, gestures: Gesture[]) => {
    setStats(prev => {
      const gesturesChanged = prev.gestures.length !== gestures.length ||
        prev.gestures.some((g, i) => g !== gestures[i]);
      if (prev.hands !== hands || prev.fps !== fps || gesturesChanged) {
        return { hands, fps, gestures };
      }
      return prev;
    });
  }, []);

  if (phase === 'start') {
    return <StartScreen onActivate={handleActivate} loading={false} error={error} />;
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <HoloCanvas mode={mode} onStats={handleStats} />
      {phase === 'active' && (
        <HUD hands={stats.hands} fps={stats.fps} mode={mode} gestures={stats.gestures} onModeChange={setMode} />
      )}
      {phase === 'loading' && (
        <div className="absolute inset-0 bg-background flex items-center justify-center" style={{ zIndex: 50 }}>
          <p className="text-holo font-heading tracking-[4px] animate-holo-pulse">
            INITIALIZING HAND TRACKER...
          </p>
        </div>
      )}
    </div>
  );
}
