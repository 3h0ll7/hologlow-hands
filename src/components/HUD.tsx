import { EffectMode, EFFECT_MODES } from '@/lib/constants';

interface Props {
  hands: number;
  fps: number;
  mode: EffectMode;
  onModeChange: (m: EffectMode) => void;
}

export default function HUD({ hands, fps, mode, onModeChange }: Props) {
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
      </div>

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
