# Convex folder layout

How `convex/` is organized so a path tells you the kind of function. A call such as `api.shows.actions.add` means the add action in the shows folder, without opening the file.

The folders below are this app’s areas. A new area in this app gets the same file rules, and its name comes from this app’s requirements.

## What a feature folder holds

One folder per area of the product (`shows`, `discover`, `profile`). Inside it, only these files, and only the ones that area actually has:

- `queries.ts` — reads
- `mutations.ts` — writes
- `actions.ts` — work that calls the outside world, such as another website’s API

Do not add an empty file for a kind the area does not have. A list that only reads is `lists/queries.ts` and nothing else.

Do not put helpers in the feature folder. A helper is any function that is not a query, a mutation, or an action.

```
convex/
  schema.ts
  crons.ts
  http.ts
  auth.ts
  auth.config.ts
  testModules.ts
  shows/
    queries.ts
    mutations.ts
    actions.ts
    __tests__/
      queries.test.ts
      mutations.test.ts
      actions.test.ts
  lib/
    showModel.ts
    __tests__/
      showModel.test.ts
  _generated/
```

The app calls `api.shows.actions.add`. A job inside Convex calls `internal.shows.mutations.insertShow`. Moving a function changes that path, so update every caller in the same change.

## What stays at the convex root

Convex loads these names only at `convex/`. Do not rename them and do not put them in a feature folder.

- `schema.ts` — tables
- `crons.ts` — the schedule. It only registers jobs. The behavior lives in the function the job calls.
- `http.ts` — HTTP routes
- `auth.ts` and `auth.config.ts` — sign-in wiring
- `_generated/` — Convex writes this. Do not organize it by hand.

`testModules.ts` stays at the root as well. Tests nested under a feature folder use it so the test runner can find `shows/queries`.

## Shared helpers

Anything that is not a query, mutation, or action goes in `convex/lib/`.

Name the file so the area is still obvious: `discoverPool.ts`, `showModel.ts`. Do not use a generic name such as `helpers.ts` or `utils.ts`.

A helper used by only one area still goes in `lib`. The feature folder stays the three kinds above. Shared auth wrappers (`authedQuery`, `authedMutation`) stay in `convex/lib/functions.ts`.

## Order inside a file

Top to bottom, so exported and async functions are visible without reading the whole file:

1. Values and validators (constants, argument shapes)
2. Types and interfaces
3. Private functions. Synchronous ones first, then `async`.
4. Exported functions. Synchronous ones first, then `async`. A Convex function (`export const get = authedQuery(...)`, and the same for a mutation or an action) is an export and sits in this last group.

## Tests

A test sits in `__tests__` next to the file it covers. The folder name is `__tests__`, with an s. The file name matches the source: `queries.ts` → `__tests__/queries.test.ts`.

Every file that has behavior we wrote gets a test. These do not, because they have no behavior of ours to prove:

- `schema.ts`, `auth.ts`, `auth.config.ts`, `http.ts`
- `crons.ts` — test the function the job calls, not the registration line
- `testModules.ts`
- `_generated/`
