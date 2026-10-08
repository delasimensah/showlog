# Contributing to the shared package

`packages/shared` holds plain TypeScript that the phone app and the Convex functions can both use: types, constants, colours, small utilities, and Zod schemas.

## What belongs here

- Types for records the app reads from Convex, when the phone app needs the same shape as the server.
- Constants such as `COLORS`, status names, and quiet-hour times.
- Pure functions with no side effects, for example formatting an episode label or a countdown.
- Zod schemas for form input.

## What does not belong here

- React or React Native components and hooks. Those live in `apps/mobile-app`.
- Convex queries, mutations, and actions. Those live in `convex/`.
- Anything that imports `react-native`, `expo-*`, or `convex/*`.

## Adding code

1. Put the file in the matching folder: `src/types`, `src/constants`, `src/utils`, or `src/validation`.
2. Export it from that folder's `index.ts`. `src/index.ts` re-exports every folder.
3. Add a test in the folder's `__tests__` directory, named after the file (`date.ts` has `__tests__/date.test.ts`).
4. Import it in the app with `import { name } from "shared";`.

## Checks

From the repo root:

```bash
yarn lint
yarn type-check
yarn test
```
