# LED Board

Turn multiple phones into a synchronized LED display. Friends hold their phones side by side — each phone shows its slice of a scrolling text banner, perfectly in sync.

## How It Works

1. **Director** creates a panel: picks text, colors, LED style, and grid layout (e.g., 4 phones in a row)
2. **Director** generates one QR code per phone position
3. **Friends** scan their assigned QR code
4. **Director** hits "Start" — all phones begin the animation in sync
5. **Hold phones together** — they form one big LED banner

No backend, no internet required after QR scan. Sync works via device clocks (NTP-accurate to ~50-100ms).

## Features

- **Scrolling text + emojis** across multiple phones
- **3 LED styles**: Dot Matrix, Smooth, Neon (glow effect)
- **Customizable**: text color, background color, scroll speed, font size
- **Grid layout**: up to 8x4 phones (32 devices)
- **Director controls**: orientation (landscape/portrait), grid dimensions
- **Fully offline** — QR contains all config, no server needed
- **Cross-platform**: Web, iOS, Android

## Tech Stack

| | Technology |
|---|---|
| **Monorepo** | Turborepo + pnpm |
| **Shared core** | Pure TypeScript (types + services) |
| **Web** | Vite + React + HTML5 Canvas |
| **iOS / Android** | Expo + React Native + Skia |
| **QR Generation** | `qrcode` (web) / `react-native-qrcode-svg` (native) |
| **QR Scanning** | `html5-qrcode` (web) / `expo-camera` (native) |

## Project Structure

```
led-board/
├── packages/
│   └── core/               # Shared types + services
│       ├── types/           # QRPayload, AnimationFrame, PhoneSlice, LEDRenderConfig
│       └── services/        # AnimationService, QRCodecService, GridService, TextLayoutService
├── apps/
│   ├── web/                 # Vite + React (deploy to Vercel)
│   │   ├── views/           # HomeView, DirectorSetupView, QRDistributionView, ScanQRView, PanelDisplayView
│   │   ├── controllers/     # useDirectorController, useParticipantController, useAnimationController
│   │   └── components/      # LEDCanvas, QRCodeDisplay, QRScanner
│   └── expo/                # Expo (iOS + Android)
│       ├── app/             # File-based routing (expo-router)
│       ├── controllers/     # Same hooks, adapted for React Native
│       └── components/      # LEDCanvas (Skia), QRCodeDisplay (SVG), QRScanner (expo-camera)
├── turbo.json
└── pnpm-workspace.yaml
```

## Architecture

```
Views → Controllers (hooks) → Services (pure TS)
```

- **Views**: Platform-specific UI
- **Controllers**: Flat React hooks wiring services to views
- **Services**: Pure functions in `@led-panel/core`, shared across web and native

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Install

```bash
pnpm install
```

### Web (development)

```bash
pnpm dev:web
# Opens http://localhost:5173
```

### Web (production build)

```bash
cd apps/web && pnpm build
# Output in apps/web/dist/
```

### Expo (iOS / Android)

```bash
cd apps/expo && pnpm dev
# Scan QR with Expo Go, or press i/a for simulator
```

### Deploy Web to Vercel

The web app is a standard Vite project. Set:
- **Root directory**: `apps/web`
- **Build command**: `pnpm build`
- **Output directory**: `dist`

## How Sync Works

Each QR code contains a complete payload:

```json
{
  "text": "HELLO WORLD 🎉",
  "speed": 100,
  "style": "dot-matrix",
  "grid": { "cols": 4, "rows": 1 },
  "position": { "col": 2, "row": 0 },
  "startTimeUTC": 1741622400000
}
```

Every phone independently computes: `scrollOffset = elapsedTime × speed`. Since all phones share the same `startTimeUTC` and have NTP-synced clocks, the animation stays aligned without any network communication.

## License

MIT
