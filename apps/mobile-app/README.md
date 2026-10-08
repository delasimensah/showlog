# Showlog phone app

The iPhone app. Expo SDK 57, Expo Router, React Native, NativeWind, Convex.

## Run it

1. From the repo root, start Convex and wait until it is ready: `yarn dev:backend`
2. Copy `.env.example` to `.env.local` in this folder and set `EXPO_PUBLIC_CONVEX_URL`.
3. From the repo root: `yarn dev:mobile`
4. Open Showlog(Dev) on the iOS simulator.

The development build has to be installed on the simulator first. See `../../docs/deployment-guide.md`.

## Commands (from this folder)

- `yarn dev` — Metro for the development build
- `yarn lint` / `yarn lint:fix`
- `yarn type-check`
- `yarn test` / `yarn test:ci`
- `yarn build:dev:ios-simulator` — development build for the simulator
- `yarn build:preview:ios` — preview build for the iPhone
- `yarn workflow:preview` — preview build, skipped when nothing native changed
- `yarn update:preview` — update push to the preview build

## App variants

`APP_VARIANT` in `app.config.ts`:

- `development` — Showlog(Dev), `com.dmstudios.showlog.dev`, simulator
- `staging` — Showlog(Staging), `com.dmstudios.showlog.staging`, iPhone
- unset — Showlog, `com.dmstudios.showlog`, reserved

## Docs

- [Project structure](./docs/project-structure.md)
- [Developer decision guide](./docs/developer-decision-guide.md)
- [Adding screens](./docs/adding-screens-guide.md)
- [Navigation](./docs/navigation-guide.md)
- [Assets](./docs/asset-management-guide.md)
- [Bottom sheets](./docs/bottom-sheet-guide.md)
- [Quick reference](./docs/quick-reference-cheat-sheet.md)
- Repo-wide guides in [`../../docs`](../../docs)
