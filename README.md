<div align="center">

# HoloGlow Hands

### Browser-Based AR Hand Tracking with Holographic Effects

[![GitHub stars](https://img.shields.io/github/stars/3h0ll7/hologlow-hands?style=social)](https://github.com/3h0ll7/hologlow-hands/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/3h0ll7/hologlow-hands?style=social)](https://github.com/3h0ll7/hologlow-hands/network)
[![GitHub issues](https://img.shields.io/github/issues/3h0ll7/hologlow-hands)](https://github.com/3h0ll7/hologlow-hands/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/3h0ll7/hologlow-hands/pulls)
[![License](https://img.shields.io/github/license/3h0ll7/hologlow-hands)](LICENSE)

<p align="center">
  <strong>Real-time hand tracking with stunning holographic glow effects — right in your browser.</strong>
</p>

[Live Demo](https://hologlowhands.lovable.app/) · [Report Bug](https://github.com/3h0ll7/hologlow-hands/issues) · [Request Feature](https://github.com/3h0ll7/hologlow-hands/issues)

</div>

---

## Features

- **Real-time Hand Tracking** — Powered by Google MediaPipe with 21 landmark points per hand
- **6 Holographic Effect Modes** — Prism, Hex Grid, Holo Ring, Matrix, Energy, Vortex
- **Gesture Recognition** — Open Palm, Fist, Peace, Point, Pinch
- **Cross-Platform** — Works on desktop and mobile browsers
- **Camera-Based** — No special hardware needed
- **Privacy-First** — All processing happens locally in your browser
- **Lightweight** — Pure browser, no installation required
- **Real-time Performance** — ~23+ FPS

## Quick Start

```bash
# Clone the repo
git clone https://github.com/3h0ll7/hologlow-hands.git
cd hologlow-hands

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and allow camera access. That's it!

## Effect Modes

| Mode | Icon | Description |
|------|------|-------------|
| **Prism** | ⬡ | Rainbow prismatic beams between hands with rotating hexagonal prisms |
| **Hex Grid** | ⎔ | Animated hexagonal grid centered on each hand with wave propagation |
| **Holo Ring** | ◎ | Concentric holographic rings with orbiting hex markers |
| **Matrix** | ▦ | Proximity-reactive hexagonal grid that responds to finger distance |
| **Energy** | ⚡ | Electric lightning arcs between fingertips with pulsating energy core |
| **Vortex** | 🌀 | Spiral vortex with hexagonal particles orbiting hand center |

### Single Hand vs Two Hands

- **One hand:** Effects radiate from your hand center and fingertips
- **Two hands:** Effects bridge between both hands — prismatic beams connect matching fingers, energy arcs span the gap, and holographic structures form at the midpoint

## Tech Stack

| Technology | Purpose |
|---|---|
| MediaPipe Hands | Hand landmark detection |
| TypeScript | Type-safe development |
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI component library |
| Canvas API | Glow rendering |

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌──────────┐    ┌───────────────────────┐  │
│  │  Webcam   │───▶│  MediaPipe Hand       │  │
│  │  Stream   │    │  Landmarker (GPU)     │  │
│  └──────────┘    └──────────┬────────────┘  │
│                              │               │
│                    21 landmarks × 2 hands    │
│                              │               │
│  ┌───────────────────────────▼────────────┐  │
│  │         Rendering Pipeline             │  │
│  │                                        │  │
│  │  Layer 1: Video Feed (mirrored)        │  │
│  │  Layer 2: Hand Skeleton (dots+lines)   │  │
│  │  Layer 3: Hologram Effects + Particles │  │
│  │  Layer 4: HUD Overlay                  │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## How Hand Tracking Works

The app uses **MediaPipe Hand Landmarker** to detect 21 key points on each hand:

```
        8   12  16  20
        |   |   |   |
    4   7   11  15  19
    |   |   |   |   |
    3   6   10  14  18
    |   |   |   |   |
    2   5   9   13  17
     \  |   |   |  /
      \ |   |   | /
        0 (wrist)
```

- **Landmarks 4, 8, 12, 16, 20** = Fingertips (used for effect anchoring)
- **Landmark 0** = Wrist
- **Landmark 9** = Palm center (energy core position)
- Detection runs at video frame rate with GPU acceleration
- Supports up to 2 hands simultaneously

## Project Structure

```
src/
├── pages/
│   └── Index.tsx              # Main page with start screen & camera view
├── components/
│   ├── StartScreen.tsx        # Animated splash with ACTIVATE button
│   ├── HoloCanvas.tsx         # Multi-layer canvas (video + skeleton + effects)
│   └── HUD.tsx                # Heads-up display (stats, mode buttons)
├── hooks/
│   ├── useHandTracking.ts     # MediaPipe init, camera setup, detection loop
│   └── useParticles.ts        # Particle pool management
├── lib/
│   ├── effects/
│   │   ├── prismEffect.ts     # Prismatic beams & hexagonal prisms
│   │   ├── hexGridEffect.ts   # Animated hex grid with wave propagation
│   │   ├── holoRingEffect.ts  # Concentric rings with orbiting markers
│   │   ├── matrixEffect.ts    # Proximity-reactive hex grid
│   │   ├── energyEffect.ts    # Lightning arcs & energy core
│   │   └── vortexEffect.ts    # Spiral vortex with hex particles
│   ├── drawingUtils.ts        # Shared helpers: drawHexagon, drawSkeleton
│   └── constants.ts           # Hand connections, fingertip indices, config
```

## Roadmap

- [x] 6 holographic effect modes
- [x] Real-time hand skeleton rendering
- [x] Gesture detection (Open Palm)
- [x] Particle system with object pooling
- [ ] Gesture writing — draw in the air with fingertips
- [ ] Glassmorphism shapes — frosted glass hexagons with depth
- [ ] Ribbon trails — silk/neon/rainbow streamers following fingers
- [ ] Screenshot & video recording
- [ ] Audio-reactive mode
- [ ] Advanced gestures (pinch, peace, thumbs up/down, fist)
- [ ] Two-hand gestures (scale, rotate, portal, clap)
- [ ] Settings panel (glow intensity, particle density, etc.)
- [ ] Onboarding tutorial for new users

## Screenshots

> Add your screenshots or GIFs here

## Contributing

Contributions are what make the open source community amazing! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Star History

<a href="https://star-history.com/#3h0ll7/hologlow-hands&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=3h0ll7/hologlow-hands&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=3h0ll7/hologlow-hands&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=3h0ll7/hologlow-hands&type=Date" />
  </picture>
</a>

## Support

If you find HoloGlow Hands useful, please consider giving it a **star** — it helps others discover the project!

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

**Hassan Salman** — [@3h0ll7](https://github.com/3h0ll7)

ICU Nurse × AI Developer — Building at the intersection of healthcare and technology.

Portfolio: [hassanaii.lovable.app](https://hassanaii.lovable.app)

---

<div align="center">
  Made with love in Najaf, Iraq
</div>
