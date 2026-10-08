# Deployment guide

Showlog runs on one iPhone and the iOS simulator. It is not published to the App Store. Both builds talk to the Convex **dev** deployment.

## The three app ids

`APP_VARIANT` in `apps/mobile-app/app.config.ts` picks the name and the id:

- **Development build** — `com.dmstudios.showlog.dev`, named Showlog(Dev). Runs on the iOS simulator and loads JavaScript from Metro on the laptop.
- **Preview build** — `com.dmstudios.showlog.staging`, named Showlog(Staging). Installed on the iPhone. Gets JavaScript changes as update pushes.
- **Production** — `com.dmstudios.showlog`. Reserved. No build is planned.

## Build quota

The free Expo plan allows 15 iOS cloud builds a month, shared by every app on the `dm-studios` Expo account. Unused builds disappear on the 1st. Every native package goes in before the first builds, so later work only needs Metro and update pushes. See `.cursor/rules/native-packages-before-phone-builds.mdc`.

## Backend

Push Convex functions from the repo root:

```bash
yarn dev:backend
```

That watches `convex/` and pushes every change to the dev deployment. `yarn dev:backend:once` pushes once and stops.

Expo builds do not push `convex/`. Push Convex before you test a change that needs a new function.

## Development build (simulator)

1. From `apps/mobile-app`: `yarn build:dev:ios-simulator`
2. When the build finishes, open its link on the laptop and install it on the simulator.
3. From the repo root: `yarn dev:mobile`
4. Open Showlog(Dev) on the simulator. It connects to Metro.

Reference: [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Preview build (iPhone)

The iPhone must be registered with the Apple account once before the first preview build:

```bash
cd apps/mobile-app
npx eas-cli device:create
```

Open the link it prints on the iPhone and install the profile. Then build:

```bash
yarn build:preview:ios
```

Or run the workflow, which skips the build when nothing native changed:

```bash
yarn workflow:preview
```

Open the build link on the iPhone and install Showlog(Staging). iOS asks you to turn on Developer Mode the first time (Settings → Privacy & Security → Developer Mode).

Reference: [Internal distribution](https://docs.expo.dev/build/internal-distribution/)

## Update push (iPhone, JavaScript only)

```bash
cd apps/mobile-app
yarn update:preview
```

Close and reopen Showlog(Staging) twice. The first open downloads the update, the second runs it. An update push cannot add a native package. That needs a new preview build.

## Environment

- `apps/mobile-app/.env.local` — `EXPO_PUBLIC_CONVEX_URL` for Metro.
- EAS environment variables (Expo dashboard → Project → Environment variables) — `EXPO_PUBLIC_CONVEX_URL` on **development** and **preview**, both the dev Convex URL. Builds and update pushes read these.
- Convex deployment — Convex Auth keys. See `docs/convex-auth-env.md`.

## Phone alerts

Phone alerts on the iPhone need an Apple push key on the Expo project, added once with `npx eas-cli credentials`. The simulator build does not receive them.
