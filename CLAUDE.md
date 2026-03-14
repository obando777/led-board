# CLAUDE.md — LED Board

## Project Overview

Multi-phone synchronized LED display. A director creates a scrolling text panel, generates a QR code, friends scan it, pick their grid position, and all phones scroll in sync using device clocks. Fully offline — no server needed.

## App Identifiers

- **Android package**: `co.corinthius.ledboard`
- **iOS bundle ID**: `co.corinthius.ledboard`
- **URL scheme**: `ledpanel`

## Monorepo Structure

- **packages/core** — Pure TypeScript: types, services (AnimationService, QRCodecService, GridService, TextLayoutService). No external deps.
- **apps/web** — Vite + React 19 web app. Uses html5-qrcode for scanning, qrcode for generation.
- **apps/expo** — Expo 52 + React Native 0.76 + Shopify Skia. Uses expo-camera for scanning, react-native-qrcode-svg for generation.

Architecture: Views → Controllers (hooks) → Services (pure TS)

## Tech Stack

- **Package manager**: pnpm 9.15.0
- **Build orchestrator**: Turborepo 2.4.0
- **TypeScript**: 5.7.0, strict mode
- **Node**: 18+
- **Java**: temurin-17 (for Android builds)
- **Android SDK**: ~/Library/Android/sdk

## Common Commands

```bash
# Install
pnpm install

# Dev
pnpm dev:web          # Vite dev server on localhost:5173
pnpm dev:expo         # Expo dev server

# Build
pnpm build            # All packages via Turbo
pnpm build:web        # Web only (output: apps/web/dist/)
pnpm build:android    # Core + Android release APK

# Type checking
pnpm typecheck        # tsc --noEmit across all packages
```

## Android APK Builds

### Prerequisites

- `JAVA_HOME` pointing to temurin-17
- `ANDROID_HOME` set to Android SDK location
- `apps/expo/android/local.properties` with `sdk.dir` set

### Regenerating Native Project

When changing `app.json` (package name, permissions, plugins, etc.), you must regenerate the native project:

```bash
cd apps/expo
npx expo prebuild --platform android --clean
```

After prebuild, you must:
1. Re-create `android/local.properties` (prebuild deletes it):
   ```
   sdk.dir=/Users/obando/Library/Android/sdk
   ```
2. Add the splash screen placeholder if missing:
   ```bash
   # splashscreen_logo.png must exist in android/app/src/main/res/drawable/
   ```
3. Clear stale expo build caches in node_modules if you get `ExpoModulesPackage` import errors:
   ```bash
   rm -rf node_modules/.pnpm/expo@52*/node_modules/expo/android/build/
   ```

### Building APKs

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
cd apps/expo/android

# Debug APK
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Release APK
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

# Both at once
./gradlew assembleDebug assembleRelease
```

Or from repo root: `pnpm build:android` (release only).

### Common Build Issues

- **`ExpoModulesPackage` not found**: Stale build cache in `node_modules/.pnpm/expo@*/node_modules/expo/android/build/`. Delete it and rebuild.
- **`splashscreen_logo` not found**: Prebuild references a splash drawable that must exist. Create a placeholder PNG in `android/app/src/main/res/drawable/`.
- **SDK location not found**: Ensure `android/local.properties` exists with `sdk.dir` path.

## Key Conventions

- Workspace packages use `workspace:*` protocol for internal deps
- Core package builds to `dist/` with TypeScript composite projects
- Expo uses file-based routing via expo-router (routes in `apps/expo/src/app/`)
- Web uses react-router-dom with hash routing
- QR payloads use compact JSON keys to minimize QR data size (see QRCodecService)
- QR codes must include `quietZone` for reliable scanning (minimum 16px)
- No ESLint or Prettier configured — rely on TypeScript strict mode

## Important Files

- `apps/expo/app.json` — Expo config (package name, permissions, plugins)
- `packages/core/src/services/QRCodecService.ts` — QR encode/decode with compact keys
- `packages/core/src/services/AnimationService.ts` — Frame generation for scrolling text
- `apps/expo/src/components/LEDCanvas.tsx` — Skia-based LED rendering (native)
- `apps/web/src/components/LEDCanvas.tsx` — Canvas-based LED rendering (web)
- `turbo.json` — Build pipeline configuration
- `pnpm-workspace.yaml` — Workspace definition
