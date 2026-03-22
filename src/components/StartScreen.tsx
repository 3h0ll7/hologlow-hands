interface Props {
  onActivate: () => void;
  loading: boolean;
  error: string | null;
}

export default function StartScreen({ onActivate, loading, error }: Props) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Hex grid bg */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52'%3E%3Cpolygon points='30,2 56,15 56,37 30,50 4,37 4,15' fill='none' stroke='%2300f0ff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 52px',
      }} />

      <h1 className="holo-title text-5xl md:text-7xl tracking-[8px] mb-4 animate-holo-pulse">
        HOLOHEX
      </h1>
      <p className="text-holo-dim text-sm md:text-base tracking-[4px] font-body mb-2">
        HAND TRACKING • HOLOGRAM GENERATOR
      </p>
      <p className="text-holo-dim text-sm font-body mb-10 text-center px-4" dir="rtl">
        ارفع إيدك قدام الكاميرا - استخدم إيد وحدة أو ثنتين للتأثيرات
      </p>

      {error && (
        <p className="text-red-400 text-sm font-body mb-4 text-center px-4">{error}</p>
      )}

      <button
        onClick={onActivate}
        disabled={loading}
        className="holo-activate-btn"
      >
        <span className="relative z-10 tracking-[4px] font-heading font-black text-lg">
          {loading ? 'INITIALIZING...' : 'ACTIVATE'}
        </span>
      </button>
    </div>
  );
}
