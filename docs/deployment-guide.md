# Deployment guide

Showlog runs on one iPhone and the iOS simulator. It is not published to the App Store. The development app and the preview app talk to the Convex **dev** deployment. The production app talks to the Convex **production** deployment.

## The three app ids

`APP_VARIANT` in `apps/mobile-app/app.config.ts` picks the name and the id:

- **Development build** — `com.dmstudios.showlog.dev`, named Showlog(Dev). Runs on the iOS simulator and loads JavaScript from Metro on the laptop.
- **Preview build** — `com.dmstudios.showlog.staging`, named Showlog(Staging). Installed on the iPhone. Gets JavaScript changes as update pushes.
- **Production build** — `com.dmstudios.showlog`, named Showlog. Installed on the iPhone from a link. Talks to the production database. Gets JavaScript changes as update pushes on the `production` channel.

## Build quota

The free Expo plan allows 15 iOS cloud builds a month, shared by every app on the `dm-studios` Expo account. Unused builds disappear on the 1st. Every native package goes in before the first builds, so later work only needs Metro and update pushes. See `.cursor/rules/native-packages-before-phone-builds.mdc`.

## Backend

Push Convex functions from the repo root:

```bash
yarn dev:backend
```

That watches `convex/` and pushes every change to the dev deployment. `yarn dev:backend:once` pushes once and stops.

`yarn deploy:backend` pushes to the production deployment. It does not copy rows. Do not point root `.env.local` at production. Do not run a demo seed with `--prod`.

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

## Production build (iPhone)

The iPhone is already registered from the preview build. The production profile in `eas.json` installs from a link (`distribution: internal`). The first build has to be started in a terminal, because Apple asks you to sign in once for the new app id `com.dmstudios.showlog`.

```bash
cd apps/mobile-app
yarn build:production:ios
```

Open the build link on the iPhone and install Showlog. It sits next to Showlog(Staging). Sign up once. That sign-up is the only account. Shows in Showlog(Staging) stay in that app.

JavaScript changes after that build:

```bash
cd apps/mobile-app
eas update --channel production --environment production
```

Close and reopen Showlog twice. An update push cannot change the database address. That address is set when the app is built, from `EXPO_PUBLIC_CONVEX_URL` on the EAS production environment.

## Environment

- `apps/mobile-app/.env.local` — `EXPO_PUBLIC_CONVEX_URL` for Metro. This stays on the dev deployment.
- EAS environment variables (Expo dashboard → Project → Environment variables) — `EXPO_PUBLIC_CONVEX_URL` on **development** and **preview** is the dev Convex URL. On **production** it is the production Convex URL.
- Convex dev deployment and Convex production deployment each have their own Convex Auth keys. See `docs/convex-auth-env.md`. Production uses a new key pair. `SITE_URL` is `showlog://` on both.

## Phone alerts

Phone alerts on the iPhone need an Apple push key on the Expo project, added once with `npx eas-cli credentials`. The simulator build does not receive them.
