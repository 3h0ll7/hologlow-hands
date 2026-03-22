import { HandData } from '../constants';
import { Gesture } from '../gestureDetection';
import { drawHexagon } from '../drawingUtils';

/** Render gesture-triggered special effects */
export function renderGestureEffects(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  gestures: Gesture[],
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  for (let h = 0; h < hands.length; h++) {
    const hand = hands[h];
    const gesture = gestures[h] || 'none';

    if (gesture === 'pinch') renderPinchEffect(ctx, hand, time, emitParticle);
    else if (gesture === 'open_palm') renderOpenPalmEffect(ctx, hand, time, emitParticle);
    else if (gesture === 'fist') renderFistEffect(ctx, hand, time, emitParticle);
  }
}

function renderPinchEffect(
  ctx: CanvasRenderingContext2D,
  hand: HandData,
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  // Concentrated energy orb between thumb & index
  const thumb = hand.fingertips[0]; // thumb tip
  const index = hand.fingertips[1]; // index tip
  const cx = (thumb.x + index.x) / 2;
  const cy = (thumb.y + index.y) / 2;

  // Pulsating core
  for (let i = 0; i < 6; i++) {
    const r = (8 + i * 6) * (0.7 + Math.sin(time * 6 + i * 0.8) * 0.3);
    const hue = (45 + i * 30 + time * 80) % 360;
    const alpha = 0.7 - i * 0.1;
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
    ctx.lineWidth = 2.5 - i * 0.3;
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Inner bright fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
  grad.addColorStop(0, `hsla(${(time * 80) % 360}, 100%, 90%, 0.9)`);
  grad.addColorStop(0.5, `hsla(${(time * 80 + 60) % 360}, 100%, 60%, 0.4)`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();

  // Crackling sparks outward
  for (let s = 0; s < 8; s++) {
    const angle = (s / 8) * Math.PI * 2 + time * 4;
    const len = 20 + Math.sin(time * 8 + s * 2) * 15;
    const hue = (s * 45 + time * 60) % 360;
    ctx.strokeStyle = `hsla(${hue}, 100%, 75%, 0.7)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    // Jagged line
    const mid1x = cx + Math.cos(angle) * len * 0.4 + (Math.random() - 0.5) * 8;
    const mid1y = cy + Math.sin(angle) * len * 0.4 + (Math.random() - 0.5) * 8;
    const endx = cx + Math.cos(angle) * len;
    const endy = cy + Math.sin(angle) * len;
    ctx.lineTo(mid1x, mid1y);
    ctx.lineTo(endx, endy);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Heavy particle emission
  if (Math.random() < 0.4) {
    emitParticle(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20, (time * 80) % 360);
  }
}

function renderOpenPalmEffect(
  ctx: CanvasRenderingContext2D,
  hand: HandData,
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  const cx = hand.palmCenter.x;
  const cy = hand.palmCenter.y;

  // Shield / force field — expanding hex rings
  for (let ring = 0; ring < 4; ring++) {
    const baseR = 50 + ring * 30;
    const pulse = Math.sin(time * 3 - ring * 0.6) * 8;
    const r = baseR + pulse;
    const hue = (120 + ring * 40 + time * 25) % 360;
    const alpha = 0.5 - ring * 0.1;

    // Hex-shaped ring (6 sided arc)
    ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`;
    ctx.shadowBlur = 15;
    drawHexagon(ctx, cx, cy, r, time * 0.5 + ring * 0.3,
      `hsla(${hue}, 80%, 65%, ${alpha})`,
      `hsla(${hue}, 80%, 65%, ${alpha * 0.08})`);
  }

  // Scanning lines radiating from palm to each fingertip
  for (let i = 0; i < hand.fingertips.length; i++) {
    const tip = hand.fingertips[i];
    const hue = (180 + i * 36 + time * 30) % 360;

    // Glowing beam
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.5)`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // Small hex at each tip
    drawHexagon(ctx, tip.x, tip.y, 8 + Math.sin(time * 4 + i) * 3,
      time * 2 + i, `hsla(${hue}, 100%, 70%, 0.7)`);

    if (Math.random() < 0.1) emitParticle(tip.x, tip.y, hue);
  }

  ctx.shadowBlur = 0;

  // Central rotating scanner symbol
  const scanAngle = time * 2;
  for (let a = 0; a < 3; a++) {
    const angle = scanAngle + (a / 3) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * 20;
    const y1 = cy + Math.sin(angle) * 20;
    const x2 = cx + Math.cos(angle) * 35;
    const y2 = cy + Math.sin(angle) * 35;
    ctx.strokeStyle = `hsla(160, 100%, 70%, 0.6)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function renderFistEffect(
  ctx: CanvasRenderingContext2D,
  hand: HandData,
  time: number,
  emitParticle: (x: number, y: number, hue: number) => void
) {
  const cx = hand.center.x;
  const cy = hand.center.y;

  // Shockwave rings expanding outward
  for (let wave = 0; wave < 3; wave++) {
    const phase = (time * 2 + wave * 1.2) % 3;
    const r = phase * 60;
    const alpha = Math.max(0, 1 - phase / 3) * 0.6;
    const hue = (0 + wave * 30 + time * 40) % 360;

    ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${alpha})`;
    ctx.lineWidth = 3 - phase * 0.8;
    ctx.shadowColor = `hsla(${hue}, 100%, 55%, ${alpha * 0.5})`;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Inner power core - dense rotating hexagons
  for (let i = 0; i < 3; i++) {
    const size = 12 + i * 8;
    const hue = (350 + i * 20 + time * 60) % 360;
    drawHexagon(ctx, cx, cy, size, -time * 3 + i * 0.5,
      `hsla(${hue}, 100%, 55%, ${0.8 - i * 0.2})`,
      `hsla(${hue}, 100%, 55%, ${0.15 - i * 0.04})`);
  }

  // Gravity well distortion lines
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + time;
    const innerR = 25;
    const outerR = 60 + Math.sin(time * 5 + i * 0.8) * 15;
    const hue = (i * 30 + time * 50) % 360;

    ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.4)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Heavy particle emission outward
  if (Math.random() < 0.3) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 20;
    emitParticle(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, (time * 50) % 360);
  }
}
