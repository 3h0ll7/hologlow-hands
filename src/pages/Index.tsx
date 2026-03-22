import { useState, useCallback } from 'react';
import StartScreen from '@/components/StartScreen';
import HoloCanvas from '@/components/HoloCanvas';
import HUD from '@/components/HUD';
import { EffectMode } from '@/lib/constants';
import { GestureName } from '@/lib/gestureClassifier';

interface StatsState {
  hands: number;
  fps: number;
  gestures: GestureName[];
  handLabels: string[];
  drawStatus: 'DRAWING...' | 'PAUSED';
  twoHandGesture: string;
  audioLevel: number;
}

export default function Index() {
  const [phase, setPhase] = useState<'start' | 'loading' | 'active'>('start');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<EffectMode>('prism');
  const [stats, setStats] = useState<StatsState>({
    hands: 0,
    fps: 0,
    gestures: [],
    handLabels: [],
    drawStatus: 'PAUSED',
    twoHandGesture: 'NONE',
    audioLevel: 0,
  });

  const handleActivate = useCallback(() => {
    setPhase('loading');
    setError(null);
    setTimeout(async () => {
      try {
        await (window as Window & typeof globalThis & { __holoStart?: () => Promise<void> }).__holoStart?.();
        setPhase('active');
      } catch (e: any) {
        setError(e.message || 'Failed to start');
        setPhase('start');
      }
    }, 200);
  }, []);

  const handleStats = useCallback((next: StatsState) => {
    setStats(prev => JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
  }, []);

  if (phase === 'start') {
    return <StartScreen onActivate={handleActivate} loading={false} error={error} />;
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <HoloCanvas mode={mode} onStats={handleStats} />
      {phase === 'active' && (
        <HUD
          hands={stats.hands}
          fps={stats.fps}
          mode={mode}
          gestures={stats.gestures}
          handLabels={stats.handLabels}
          drawStatus={stats.drawStatus}
          twoHandGesture={stats.twoHandGesture}
          audioLevel={stats.audioLevel}
          onModeChange={setMode}
        />
      )}
      {phase === 'loading' && (
        <div className="absolute inset-0 bg-background flex items-center justify-center" style={{ zIndex: 50 }}>
          <p className="text-holo font-heading tracking-[4px] animate-holo-pulse">INITIALIZING HAND TRACKER...</p>
        </div>
      )}
    </div>
  );
}
