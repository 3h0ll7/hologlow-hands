import { useEffect, useMemo, useState } from 'react';
import { Camera, Palette, RotateCcw, Settings2 } from 'lucide-react';
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
  spread: { label: 'SPREAD', icon: '🖐️' },
  grab: { label: 'GRAB', icon: '✊' },
};

const defaultSettings = {
  particleDensity: 60,
  glowIntensity: 75,
  ribbonLength: 72,
  effectScale: 100,
  cameraBrightness: 100,
};

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
  const [settings, setSettings] = useState(defaultSettings);
  const [gestureOverlay, setGestureOverlay] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('holo-settings');
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('holo-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const active = gestures.find(gesture => gesture !== 'none');
    if (!active) return;
    setGestureOverlay(`${GESTURE_LABELS[active].icon} ${GESTURE_LABELS[active].label}`);
    const id = window.setTimeout(() => setGestureOverlay(''), 500);
    return () => window.clearTimeout(id);
  }, [gestures]);

  const activeGestures = useMemo(() => gestures.filter(g => g !== 'none'), [gestures]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <h1 className="holo-title text-2xl md:text-3xl tracking-[6px]">HOLOGLOW HANDS v2</h1>
        <p className="text-holo-dim text-xs tracking-[4px] font-body mt-1">GLASS • RIBBON • DRAW • AUDIO</p>
      </div>

      <div className="absolute top-4 left-4 font-body text-xs space-y-1 rounded-xl border border-cyan-400/20 bg-black/25 p-3 backdrop-blur-md">
        <div className="text-holo-dim">HANDS <span className="text-holo">{hands}</span></div>
        <div className="text-holo-dim">FPS <span className="text-holo">{fps}</span></div>
        <div className="text-holo-dim">MODE <span className="text-holo">{EFFECT_MODES.find(m => m.id === mode)?.name}</span></div>
        <div className="text-holo-dim">DRAW <span className="text-holo">{drawStatus}</span></div>
        <div className="text-holo-dim">SYNC <span className="text-holo">{twoHandGesture}</span></div>
        <div className="text-holo-dim">AUDIO <span className="text-holo">{Math.round(audioLevel * 100)}%</span></div>
        {activeGestures.map((gesture, i) => (
          <div key={`${gesture}-${i}`} className="text-holo-dim">
            {handLabels[i] ?? `HAND ${i + 1}`} <span className="text-holo">{GESTURE_LABELS[gesture].icon} {GESTURE_LABELS[gesture].label}</span>
          </div>
        ))}
      </div>

      {gestureOverlay && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <div className="holo-gesture-badge font-heading text-sm tracking-[3px] animate-in fade-in">{gestureOverlay}</div>
        </div>
      )}

      {hands === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-holo-dim text-lg font-body animate-pulse">Raise your hand to activate the hologram.</p>
          <p className="mt-3 text-xs text-cyan-100/70">Tutorial: open palm → point → pinch to draw → hold fist to clear.</p>
        </div>
      )}

      {mode === 'draw' && (
        <div className="absolute right-4 top-24 pointer-events-auto rounded-2xl border border-cyan-300/30 bg-black/35 p-3 backdrop-blur-md">
          <div className="mb-2 text-[11px] tracking-[2px] text-cyan-100">DRAW PALETTE</div>
          <div className="flex items-center gap-2">
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:color'))}><Palette className="h-4 w-4" /></button>
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:style'))}>STYLE</button>
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:undo'))}><RotateCcw className="h-4 w-4" /></button>
            <button className="holo-btn !px-3" onClick={() => window.dispatchEvent(new Event('holo:clear'))}>CLEAR</button>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 pointer-events-auto flex gap-2">
        <button className="holo-btn" onClick={() => window.dispatchEvent(new Event('holo:capture'))}><Camera className="mr-1 h-4 w-4" />SHOT</button>
        <button className={`holo-btn ${settingsOpen ? 'holo-btn-active' : ''}`} onClick={() => setSettingsOpen(value => !value)}><Settings2 className="mr-1 h-4 w-4" />SETTINGS</button>
      </div>

      {settingsOpen && (
        <div className="absolute right-4 top-16 w-72 rounded-2xl border border-cyan-300/25 bg-black/45 p-4 pointer-events-auto backdrop-blur-xl">
          <div className="mb-3 text-sm tracking-[3px] text-cyan-100">CONTROL DECK</div>
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="mb-3">
              <div className="mb-1 text-[11px] uppercase tracking-[2px] text-cyan-100/70">{key.replace(/([A-Z])/g, ' $1')}</div>
              <Slider
                value={[value]}
                min={0}
                max={key === 'ribbonLength' ? 100 : 150}
                step={1}
                onValueChange={([next]) => setSettings(prev => ({ ...prev, [key]: next }))}
              />
            </div>
          ))}
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 pointer-events-auto max-w-[min(92vw,1100px)]">
        {EFFECT_MODES.map(m => (
          <button key={m.id} onClick={() => onModeChange(m.id)} className={`holo-btn transition-all duration-300 ${mode === m.id ? 'holo-btn-active' : ''}`}>
            <span className="mr-1">{m.icon}</span>
            <span className="hidden sm:inline">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
