# Welcome to your Lovable project

TODO: Document your project here
# 🖐️ HoloGlow Hands — AR Hand Hologram Generator

> Transform your hands into hologram generators using AI-powered real-time hand tracking.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-hologlowhands.lovable.app-00f0ff?style=for-the-badge)](https://hologlowhands.lovable.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)]()
[![MediaPipe](https://img.shields.io/badge/MediaPipe-FF6F00?style=flat-square&logo=google&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)]()

---

## ✨ What is HoloGlow Hands?

HoloGlow Hands is a browser-based augmented reality experience that uses your webcam and AI hand tracking to generate stunning holographic visual effects in real-time. No app install needed — just open the website and raise your hands.

**Key highlights:**
- 🤖 AI-powered hand tracking with 21 landmark points per hand
- 🎨 6 unique holographic effect modes
- ✋ Gesture recognition (Open Palm, Fist, Peace, Point, Pinch)
- 📱 Works on mobile and desktop browsers
- ⚡ Real-time performance (~23+ FPS)
- 🔒 Privacy-first: all processing happens locally in your browser

---

## 🎬 Demo

🔗 **[Try it live → hologlowhands.lovable.app](https://hologlowhands.lovable.app/)**

> Requires a device with a camera and a modern browser (Chrome, Edge, Safari 16+, Firefox).

---

## 🎮 Effect Modes

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

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **MediaPipe Tasks Vision** | AI hand landmark detection (21 points per hand) |
| **HTML5 Canvas API** | Real-time 2D effect rendering |
| **Lovable** | Development platform & deployment |

---

## 🏗️ Architecture

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

---

## 📁 Project Structure

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
│   │   ├── prismEffect.ts     # ⬡ Prismatic beams & hexagonal prisms
│   │   ├── hexGridEffect.ts   # ⎔ Animated hex grid with wave propagation
│   │   ├── holoRingEffect.ts  # ◎ Concentric rings with orbiting markers
│   │   ├── matrixEffect.ts    # ▦ Proximity-reactive hex grid
│   │   ├── energyEffect.ts    # ⚡ Lightning arcs & energy core
│   │   └── vortexEffect.ts    # 🌀 Spiral vortex with hex particles
│   ├── drawingUtils.ts        # Shared helpers: drawHexagon, drawSkeleton
│   └── constants.ts           # Hand connections, fingertip indices, config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/3h0ll7/hologlow-hands.git
cd hologlow-hands

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `https://localhost:5173` in your browser (HTTPS required for camera access).

### Build for Production

```bash
npm run build
```

---

## 🤝 How Hand Tracking Works

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

---

## 🗺️ Roadmap

- [x] 6 holographic effect modes
- [x] Real-time hand skeleton rendering
- [x] Gesture detection (Open Palm)
- [x] Particle system with object pooling
- [ ] ✏️ Gesture writing — draw in the air with fingertips
- [ ] 💎 Glassmorphism shapes — frosted glass hexagons with depth
- [ ] 🎀 Ribbon trails — silk/neon/rainbow streamers following fingers
- [ ] 📸 Screenshot & video recording
- [ ] 🎵 Audio-reactive mode
- [ ] 🤏 Advanced gestures (pinch, peace, thumbs up/down, fist)
- [ ] 🫲🫱 Two-hand gestures (scale, rotate, portal, clap)
- [ ] ⚙️ Settings panel (glow intensity, particle density, etc.)
- [ ] 📖 Onboarding tutorial for new users

---

## 🧑‍💻 Author

**Hassan Salman** — [@3h0ll7](https://github.com/3h0ll7)

ICU Nurse 🏥 × AI Developer 🤖 — Building at the intersection of healthcare and technology.

**Brand:** [Digital Nurse Buddy](https://github.com/3h0ll7)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🌟 Star This Repo!

If you found this project interesting or useful, please give it a ⭐ on GitHub — it helps others discover it!

---

<p align="center">
  Built with 🖐️ and ✨ by <a href="https://github.com/3h0ll7">Hassan Salman</a>
  <br/>
  <a href="https://hologlowhands.lovable.app/">🚀 Try the Live Demo</a>
</p>
