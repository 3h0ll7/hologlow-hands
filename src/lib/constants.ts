export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

export const FINGERTIP_INDICES = [4, 8, 12, 16, 20] as const;
export const PALM_INDEX = 9;

export const COLORS = {
  cyan: '#00f0ff',
  green: '#00ff44',
  red: '#ff2244',
  bg: '#000000',
  glass: 'rgba(255,255,255,0.08)',
} as const;

export type EffectMode =
  | 'prism'
  | 'hex'
  | 'ring'
  | 'matrix'
  | 'energy'
  | 'vortex'
  | 'glass'
  | 'ribbon'
  | 'draw'
  | 'audio';

export const EFFECT_MODES: { id: EffectMode; name: string; icon: string }[] = [
  { id: 'prism', name: 'PRISM', icon: '⬡' },
  { id: 'hex', name: 'HEX', icon: '⎔' },
  { id: 'ring', name: 'RING', icon: '◎' },
  { id: 'matrix', name: 'MATRIX', icon: '▦' },
  { id: 'energy', name: 'ENERGY', icon: '⚡' },
  { id: 'vortex', name: 'VORTEX', icon: '🌀' },
  { id: 'glass', name: 'GLASS', icon: '💎' },
  { id: 'ribbon', name: 'RIBBON', icon: '🎀' },
  { id: 'draw', name: 'DRAW', icon: '✏️' },
  { id: 'audio', name: 'AUDIO', icon: '🎵' },
];

export const PARTICLE_POOL_SIZE = 260;
export const GESTURE_THRESHOLDS = {
  pinchPx: 30,
  spreadPx: 200,
  clearHoldMs: 1500,
  stableFrames: 3,
};

export const DRAW_COLORS = ['#00f0ff', '#ff4fd8', '#8b5cf6', '#22c55e', '#f59e0b'];
export const DRAW_STYLES = ['NEON', 'HOLOGRAM', 'RIBBON', 'PARTICLE_TRAIL'] as const;
export type DrawStyle = (typeof DRAW_STYLES)[number];

export const RIBBON_CONFIG = {
  maxHistory: 72,
  maxWidth: 26,
  taperPower: 0.7,
};

export const GLASS_CONFIG = {
  bodyAlpha: 0.08,
  tintAlpha: 0.06,
  shadowBlur: 8,
};

export const AUDIO_DEFAULTS = {
  enabled: false,
  bassScale: 0.35,
  midHueShift: 0.18,
  highParticleBoost: 0.2,
};

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  active: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: Landmark[];
  center: Point2D;
  fingertips: Point2D[];
  palmCenter: Point2D;
  gesture: import('./gestureClassifier').GestureName;
  gestureConfidence: number;
  hand: 'left' | 'right';
  pinchDistance: number;
  velocity: number;
}
