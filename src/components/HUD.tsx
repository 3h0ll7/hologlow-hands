import { useEffect, useMemo, useState } from 'react';
import { Palette, RotateCcw, Settings2 } from 'lucide-react';
import { EffectMode, EFFECT_MODES } from '@/lib/constants';
import { GestureName } from '@/lib/gestureClassifier';
import { Slider } from '@/components/ui/slider';

const GESTURE_LABELS: Record<GestureName, { label: string; icon: string }> = {
  none: { label: '—', icon: '' },
  pinch: { label: 'PINCH', icon: '🤏' },
  open_palm: { label: 'OPEN PALM', icon: '🖐' },
  fist: { label: 'FIST', icon: '✊' },
  peace: { label: 'PEACE', icon: '✌️' },
  thumbs_up: { label: 'THUMBS UP', icon: '👍' },
  thumbs_down: { label: 'THUMBS DOWN', icon: '👎' },
  point: { label: 'POINT', icon: '👆' },
  spread: { label: 'SPREAD', icon: '🖐' },
  grab: { label: 'GRAB', icon: '✊' },
};

interface FloatingGesture {
  id: string;
  x: number;
  y: number;
  icon: string;
}

interface Props {
  hands: number;
  fps: number;
  mode: EffectMode;
  gestures: GestureName[];
  handLabels: string[];
  drawStatus: 'DRAWING...' | 'PAUSED';
  twoHandGesture: string;
  audioLevel: number;
  onModeChange: (m: EffectMode) => void;
}

export default function HUD({ hands, fps, mode, gestures, handLabels, drawStatus, twoHandGesture, audioLevel, onModeChange }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    const raw = localStorage.getItem('holo-settings');
    return raw ? JSON.parse(raw) : { particleDensity: 60, glowIntensity: 75, ribbonLength: 60, effectScale: 100, cameraBrightness: 100 };
  });
  const [floatingGestures, setFloatingGestures] = useState<FloatingGesture[]>([]);

  useEffect(() => {
    localStorage.setItem('holo-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleGesture = (event: Event) => {
      const detail = (event as CustomEvent<{ center: { x: number; y: number }; gesture: GestureName; index: number }>).detail;
      if (!detail?.gesture || detail.gesture === 'none') return;

      const id = `${detail.index}-${detail.gesture}-${Date.now()}`;
      setFloatingGestures(prev => [...prev, { id, x: detail.center.x, y: detail.center.y - 60, icon: GESTURE_LABELS[detail.gesture].icon }]);
      window.setTimeout(() => {
        setFloatingGestures(prev => prev.filter(item => item.id !== id));
      }, 500);
    };

    window.addEventListener('gesture', handleGesture);
    return () => window.removeEventListener('gesture', handleGesture);
  }, []);

  const activeGestures = useMemo(() => gestures.filter(gesture => gesture !== 'none'), [gestures]);

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 30 }}>
      <div className="absolute left-1/2 top-4 -translate-x-1/2 text-center">
        <h1 className="holo-title text-2xl tracking-[6px] md:text-3xl">HOLOGLOW HANDS v2</h1>
        <p className="mt-1 text-xs font-body tracking-[4px] text-holo-dim">GLASS • RIBBON • DRAW</p>
      </div>

      <div className="absolute left-4 top-4 space-y-1 rounded-xl border border-cyan-400/20 bg-black/25 p-3 font-body text-xs backdrop-blur-md">
        <div className="text-holo-dim">HANDS <span className="text-holo">{hands}</span></div>
        <div className="text-holo-dim">FPS <span className="text-holo">{fps}</span></div>
        <div className="text-holo-dim">MODE <span className="text-holo">{EFFECT_MODES.find(item => item.id === mode)?.name}</span></div>
        <div className="text-holo-dim">DRAW <span className="text-holo">{drawStatus}</span></div>
        <div className="text-holo-dim">SYNC <span className="text-holo">{twoHandGesture}</span></div>
        <div className="text-holo-dim">CAPTURE <span className="text-holo">👍 / 📸</span></div>
        <div className="text-holo-dim">FLASH <span className="text-holo">{Math.round(audioLevel * 100)}%</span></div>
        {activeGestures.map((gesture, index) => (
          <div key={`${gesture}-${index}`} className="text-holo-dim">
            {handLabels[index] ?? `HAND ${index + 1}`} <span className="text-holo">{GESTURE_LABELS[gesture].icon} {GESTURE_LABELS[gesture].label}</span>
          </div>
        ))}
      </div>

      {floatingGestures.map(gesture => (
        <div
          key={gesture.id}
          className="absolute text-4xl drop-shadow-[0_0_18px_rgba(255,255,255,0.7)] animate-out fade-out duration-500"
          style={{ left: gesture.x, top: gesture.y, transform: 'translate(-50%, -50%)' }}
        >
          {gesture.icon}
        </div>
      ))}

      {hands === 0 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="animate-pulse text-lg font-body text-holo-dim">Raise your hand to activate the hologram.</p>
          <p className="mt-3 text-xs text-cyan-100/70">Tutorial: pinch to draw • peace to swap color • hold fist 1.5s to clear.</p>
        </div>
      )}

      {mode === 'draw' && (
        <div className="pointer-events-auto absolute right-4 top-24 rounded-2xl border border-cyan-300/30 bg-black/35 p-3 backdrop-blur-md">
          <div className="mb-2 text-[11px] tracking-[2px] text-cyan-100">DRAW PALETTE</div>
          <div className="flex items-center gap-2">
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:color'))}><Palette className="h-4 w-4" /></button>
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:undo'))}><RotateCcw className="h-4 w-4" /></button>
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:clear'))}>CLEAR</button>
          </div>
        </div>
      )}

      <div className="pointer-events-auto absolute right-4 top-4 flex gap-2">
        <button className="holo-btn" onClick={() => window.dispatchEvent(new Event('holo:capture'))}>📸 SHOT</button>
        <button className={`holo-btn ${settingsOpen ? 'holo-btn-active' : ''}`} onClick={() => setSettingsOpen(value => !value)}><Settings2 className="mr-1 h-4 w-4" />SETTINGS</button>
      </div>

      {settingsOpen && (
        <div className="pointer-events-auto absolute right-4 top-16 w-72 rounded-2xl border border-cyan-300/25 bg-black/45 p-4 backdrop-blur-xl">
          <div className="mb-3 text-sm tracking-[3px] text-cyan-100">CONTROL DECK</div>
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="mb-3">
              <div className="mb-1 text-[11px] uppercase tracking-[2px] text-cyan-100/70">{key.replace(/([A-Z])/g, ' $1')}</div>
              <Slider value={[value]} min={0} max={key === 'ribbonLength' ? 100 : 150} step={1} onValueChange={([next]) => setSettings((prev: typeof settings) => ({ ...prev, [key]: next }))} />
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-auto absolute bottom-6 left-1/2 flex max-w-[min(92vw,1100px)] -translate-x-1/2 flex-wrap justify-center gap-2">
        {EFFECT_MODES.map(item => (
          <button key={item.id} onClick={() => onModeChange(item.id)} className={`holo-btn transition-all duration-300 ${mode === item.id ? 'holo-btn-active' : ''}`}>
            <span className="mr-1">{item.icon}</span>
            <span className="hidden sm:inline">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
