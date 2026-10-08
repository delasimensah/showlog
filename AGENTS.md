# Agent instructions for Showlog

Showlog is a personal iPhone app for tracking TV shows and anime: find a show, add it to the list, tick off episodes, see where you left off, and get a phone alert when a new episode is out. Show data comes from the TVmaze API.

This is a **Turborepo** with an **Expo** iPhone app, a **shared** package, and a **Convex** backend. Convex Auth (email and password) is the sign-in path.

## Where we left off

Read **`STATUS.md`** at the repo root before planning or implementing. Update it when you finish a phase or change the next action. On a feature branch, write it as the state after that pull request merges. Do not put secrets in `STATUS.md`.

## Compliance (do this before coding)

- **`.cursor/rules/wait-for-approval-before-git.mdc`** — Do the work, then stop. Do not commit, push, or open a pull request until you are asked.
- **`.cursor/rules/explain-the-work.mdc`** — After a task, explain what changed in everyday words, then the files and why, then the test commands.
- **`.cursor/rules/mandatory-project-docs.mdc`** — For your task type, **read the listed `docs/...` files** with the Read tool before implementing.
- **Lint (barrel imports):** Top-level barrels — `@/constants`, `@/hooks`, `@/utils`, `@/types`, `shared`. Inside `components/`, relative imports for components.

## Code organization and style

- **Phone app:** `apps/mobile-app/docs/project-structure.md`, `apps/mobile-app/docs/developer-decision-guide.md`, and `apps/mobile-app/docs/adding-screens-guide.md`.
- **Shared package:** `packages/shared/docs/contributing-guide.md`.
- **Imports / exports / components:** `docs/import-patterns-guide.md`, `docs/export-patterns-guide.md`, `docs/component-organization-guide.md`.

## Product and architecture

- **`docs/product/locked-decisions.md`** and **`docs/product/product-requirements.md`** — What we are building. Do not invent features that are not in these files.
- **`docs/product/system-design.md`** and **`docs/product/convex-design.md`** — Only after those files exist. Until then, do not invent tables or permission rules beyond the product requirements and the thin Convex auth start.
- **`docs/product/linear-tickets.md`** — Tickets `SHOW-n`, build order, and status, once written.
- **`docs/design/`** — Screen design. `docs/design/references/tvtime/` holds layout references only.

## Stack and official docs

Prefer these official sources. Add them as **@Docs** in Cursor (Settings → Indexing & Docs).

- Turborepo, TypeScript, Yarn workspaces — https://turborepo.com/docs
- Expo, Expo Router, Expo UI — https://docs.expo.dev/
- React Native — https://reactnative.dev/docs/getting-started
- NativeWind — https://www.nativewind.dev/
- Convex — https://docs.convex.dev
- Convex Auth — https://labs.convex.dev/auth
- Zod — https://zod.dev
- TVmaze API — https://www.tvmaze.com/api

## Hard rules for this product

- One account only. The first sign-up creates the account. The server refuses any later sign-up.
- Show data comes from TVmaze through Convex actions. The phone never calls TVmaze directly. Every call sends a User-Agent that names Showlog. On a 429 reply, wait and retry. Stay under 20 calls every 10 seconds.
- Show "Show data from TVmaze" with a link on the show screen and on Profile. The data is CC BY-SA.
- Posters load from TVmaze image URLs. Nothing is stored in Convex file storage.
- Specials (episodes outside the numbered seasons) are left out of counts, Up next, and stats. TVmaze leaves them out by default.
- Seasons numbered by year (One Piece) show "Episode 1180" first, then "2026 · E25". Other shows use "S4 | E11".
- Product data uses Convex `useQuery` / `useMutation` / `useAction`. Check the signed-in user at the top of every public Convex function. The client is not trusted.
- Convex Auth needs `JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL` on the Convex deployment. Read `docs/convex-auth-env.md`. A sign-in ticket is not done until those three names exist on that Convex. Do not commit the keys.
- iPhone only. The development build runs on the simulator. The preview build runs on the iPhone. Both use the Convex dev deployment.
- Zustand is only for client extras, not show data.
- Branches: `feature/SHOW-n` for a ticket that already exists in `docs/product/linear-tickets.md`.

## How to get the best results

1. Read `STATUS.md`, then the product docs for the slice.
2. One ticket at a time. Screen design agreed before the ticket goes In Progress.
3. Run `yarn lint`, `yarn format:check`, `yarn type-check`, and `yarn test:ci` before you say the work is done.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
