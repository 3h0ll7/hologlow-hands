import { useState, useCallback } from 'react';
import StartScreen from '@/components/StartScreen';
import HoloCanvas from '@/components/HoloCanvas';
import HUD from '@/components/HUD';
import { EffectMode } from '@/lib/constants';

export default function Index() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<EffectMode>('prism');
  const [stats, setStats] = useState({ hands: 0, fps: 0 });

  const handleActivate = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Small delay so component mounts the video element
    setTimeout(async () => {
      try {
        await (window as any).__holoStart?.();
        setActive(true);
      } catch (e: any) {
        setError(e.message || 'Failed to start');
      } finally {
        setLoading(false);
      }
    }, 100);
  }, []);

  const handleStats = useCallback((hands: number, fps: number) => {
    setStats(prev => (prev.hands !== hands || prev.fps !== fps) ? { hands, fps } : prev);
  }, []);

  if (!active && !loading) {
    return <StartScreen onActivate={handleActivate} loading={loading} error={error} />;
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <HoloCanvas mode={mode} onStats={handleStats} />
      {active && <HUD hands={stats.hands} fps={stats.fps} mode={mode} onModeChange={setMode} />}
      {loading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <p className="text-holo font-heading tracking-[4px] animate-pulse">INITIALIZING HAND TRACKER...</p>
        </div>
      )}
    </div>
  );
}
