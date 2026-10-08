# Phone app project structure

> **Purpose**: Where files go in `apps/mobile-app`.

## Folders

- `app/` — Expo Router routes only. Each file is a route that renders a screen from `@/components`. No screen UI in route files.
- `components/` — every component, in a category folder:
  - `ui/` — building blocks (Stack, Text, Button, SkeletonCard, EmptyState, and so on)
  - `shared/` — app-wide pieces (`AppProviders`, `LoadingScreen`)
  - `feedback/` — toasts
  - `bottom-sheets/` — sheets and the sheet manager
  - `screens/[stack]/` — full screens, named `*Screen`
  - `[feature]/` — pieces of one feature, for example `upNext/` or `discover/`
- `hooks/[category]/` — hooks, for example `hooks/shows/useUpNext.ts`. Exported from `hooks/index.ts`.
- `utils/` — plain helpers and form schemas. Exported from `utils/index.ts`. Tests in `utils/__tests__/`.
- `constants/` — `COLORS`, `FONTS`, `ASSETS`. Exported from `constants/index.ts`.
- `types/` — types used across more than one file. Exported from `types/index.ts`.
- `assets/` — icons, splash image, fonts.
- `docs/` — this folder.

## Data

- Convex is the data layer. Screens and hooks call `useQuery`, `useMutation`, and `useAction` with `api` from `@convex/_generated/api`.
- `components/shared/AppProviders/AppProviders.tsx` creates the Convex client and wraps the app in `ConvexAuthProvider`. The sign-in session is kept in `expo-secure-store`.
- `utils/convexClient.ts` reads `EXPO_PUBLIC_CONVEX_URL`.
- Show data from TVmaze is fetched by Convex actions on the server, not by the phone.
- Zustand is for client-only state, for example which bottom sheet is open (`hooks/bottom-sheets/useBottomsheetStore.ts`).

## Barrels

- `components/index.ts` exports only components used outside `components/`.
- Inside `components/`, import other components by relative path.
- Outside `components/`, import from `@/components`, `@/hooks`, `@/utils`, `@/constants`, `@/types`, and `shared`. Never a deep path into those folders.
- No `index.ts` inside a subfolder.

## Config files

- `app.config.ts` — app name, ids, plugins. `APP_VARIANT` picks development, staging, or production.
- `eas.json` — Expo build profiles.
- `.eas/workflows/preview.yml` — the iOS preview workflow.
- `jest.setup.ts` — mocks for native packages under Jest.
- `tailwind.config.js`, `global.css` — NativeWind theme. Colours come from `packages/shared/src/constants/colors.ts`.
