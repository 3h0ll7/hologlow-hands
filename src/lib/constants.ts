export const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
];

export const FINGERTIP_INDICES = [4, 8, 12, 16, 20];
export const PALM_INDEX = 9;

export const COLORS = {
  cyan: '#00f0ff',
  green: '#00ff44',
  red: '#ff2244',
  bg: '#000000',
} as const;

export type EffectMode = 'prism' | 'hex_grid' | 'holo_ring' | 'matrix' | 'energy' | 'vortex';

export const EFFECT_MODES: { id: EffectMode; name: string; icon: string }[] = [
  { id: 'prism', name: 'PRISM', icon: '⬡' },
  { id: 'hex_grid', name: 'HEX GRID', icon: '⎔' },
  { id: 'holo_ring', name: 'HOLO RING', icon: '◎' },
  { id: 'matrix', name: 'MATRIX', icon: '▦' },
  { id: 'energy', name: 'ENERGY', icon: '⚡' },
  { id: 'vortex', name: 'VORTEX', icon: '🌀' },
];

export const PARTICLE_POOL_SIZE = 200;

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; hue: number;
  active: boolean;
}

export interface HandData {
  landmarks: { x: number; y: number; z: number }[];
  center: { x: number; y: number };
  fingertips: { x: number; y: number }[];
  palmCenter: { x: number; y: number };
}
