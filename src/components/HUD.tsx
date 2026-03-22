import { EffectMode, EFFECT_MODES } from '@/lib/constants';
import { Gesture } from '@/lib/gestureDetection';

const GESTURE_LABELS: Record<Gesture, { label: string; icon: string }> = {
  none: { label: '—', icon: '' },
  pinch: { label: 'PINCH', icon: '🤏' },
  open_palm: { label: 'OPEN PALM', icon: '🖐' },
  fist: { label: 'FIST', icon: '✊' },
};

interface Props {
  hands: number;
  fps: number;
  mode: EffectMode;
  gestures: Gesture[];
  onModeChange: (m: EffectMode) => void;
}

export default function HUD({ hands, fps, mode, gestures, onModeChange }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {/* Top center title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <h1 className="holo-title text-2xl md:text-3xl tracking-[6px]">HOLOHEX</h1>
        <p className="text-holo-dim text-xs tracking-[4px] font-body mt-1">HOLOGRAM ACTIVE</p>
      </div>

      {/* Top left stats */}
      <div className="absolute top-4 left-4 font-body text-xs space-y-1">
        <div className="text-holo-dim">
          HANDS <span className="text-holo">{hands}</span>
        </div>
        <div className="text-holo-dim">
          FPS <span className="text-holo">{fps}</span>
        </div>
        <div className="text-holo-dim">
          MODE <span className="text-holo">{EFFECT_MODES.find(m => m.id === mode)?.name}</span>
        </div>
        {gestures.map((g, i) => g !== 'none' && (
          <div key={i} className="text-holo-dim">
            HAND {i + 1} <span className="text-holo">{GESTURE_LABELS[g].icon} {GESTURE_LABELS[g].label}</span>
          </div>
        ))}
      </div>

      {/* Gesture badge — center top when active */}
      {gestures.some(g => g !== 'none') && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <div className="holo-gesture-badge font-heading text-sm tracking-[3px]">
            {gestures.filter(g => g !== 'none').map(g => `${GESTURE_LABELS[g].icon} ${GESTURE_LABELS[g].label}`).join(' • ')}
          </div>
        </div>
      )}

      {/* No hands hint */}
      {hands === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-holo-dim text-lg font-body animate-pulse" dir="rtl">
            ارفع إيدك قدام الكاميرا
          </p>
        </div>
      )}

      {/* Bottom mode buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 pointer-events-auto">
        {EFFECT_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`holo-btn ${mode === m.id ? 'holo-btn-active' : ''}`}
          >
            <span className="mr-1">{m.icon}</span>
            <span className="hidden sm:inline">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
