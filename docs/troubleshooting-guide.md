# Troubleshooting guide

## The app shows a red screen about `EXPO_PUBLIC_CONVEX_URL`

The phone app does not know which Convex to call.

1. From the repo root, run `yarn dev:backend` once and wait until it says the functions are ready.
2. Copy `CONVEX_URL` from the root `.env.local`.
3. Put it in `apps/mobile-app/.env.local` as `EXPO_PUBLIC_CONVEX_URL=…`.
4. Restart Metro with `yarn dev:mobile`.

For the preview build, the value comes from the EAS environment variables, not from `.env.local`.

## Sign-in crashes with `Missing environment variable JWT_PRIVATE_KEY`

The Convex Auth keys are not on the dev deployment. Follow `docs/convex-auth-env.md`.

## A new Convex function is "not found"

The dev deployment does not have it yet. Run `yarn dev:backend` from the repo root and wait for the push.

## Metro serves old code

```bash
cd apps/mobile-app
npx expo start --dev-client --clear
```

## A package version warning from Expo

```bash
cd apps/mobile-app
npx expo install --check
```

Accept the versions Expo suggests. React Native and React are pinned by the Expo SDK.

## Tests fail on an import from a native package

Add a mock for that package in `apps/mobile-app/jest.setup.ts`. Native code does not run under Jest.

## The preview app does not pick up an update push

- Close and reopen the app twice.
- The update must target the same app version as the installed build. A native change needs a new preview build, not an update push.

## Clean install

```bash
yarn clean
yarn install
```
