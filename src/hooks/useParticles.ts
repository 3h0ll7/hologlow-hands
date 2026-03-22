import { useRef, useCallback } from 'react';
import { Particle, PARTICLE_POOL_SIZE } from '@/lib/constants';

export function useParticles() {
  const pool = useRef<Particle[]>(
    Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 60, size: 3, hue: 0, active: false,
    }))
  );

  const emit = useCallback((x: number, y: number, hue: number) => {
    const p = pool.current.find(p => !p.active);
    if (!p) return;
    p.x = x; p.y = y;
    p.vx = (Math.random() - 0.5) * 3;
    p.vy = (Math.random() - 0.5) * 3;
    p.life = 0;
    p.maxLife = 30 + Math.random() * 40;
    p.size = 2 + Math.random() * 3;
    p.hue = hue;
    p.active = true;
  }, []);

  const update = useCallback(() => {
    for (const p of pool.current) {
      if (!p.active) continue;
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.96; p.vy *= 0.96;
      p.life++;
      if (p.life >= p.maxLife) p.active = false;
    }
  }, []);

  return { particles: pool.current, emit, update };
}
