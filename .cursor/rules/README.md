# Cursor rules (Showlog)

Rules guide the agent for this monorepo.

## Always on (every chat)

- **`build-the-screen-the-usual-way.mdc`** — Known controls stay on screen while data loads.
- **`skeletons-match-the-screen.mdc`** — Skeletons only for the values still loading, in the loaded row shape.
- **`ticket-status.mdc`** — Todo, In Progress, Done in `docs/product/linear-tickets.md`. Done means merged. Write STATUS as the post-merge state on a feature branch.
- **`wait-for-approval-before-git.mdc`** — Implement and stop. Do not commit, push, or open a PR until asked.
- **`pr-description-from-guidelines.mdc`** — PR body is Why / What / How / Testing from `docs/git-and-pr-guidelines.md`. Never Summary / Test plan.
- **`wait-for-github-checks-on-pr.mdc`** — Local `yarn lint`, `yarn format:check`, `yarn type-check`, and `yarn test:ci` are the PR bar. Do not wait on GitHub.
- **`never-branch-off-a-ticket.mdc`** — Only `feature/SHOW-n` for a ticket that already exists.
- **`phone-tasks-must-be-testable.mdc`** — Simulator for the development build, his iPhone for the preview build.
- **`native-packages-before-phone-builds.mdc`** — Native packages go in before the first builds. JavaScript changes ship as updates.
- **`tests-necessary-and-fast.mdc`** — Few, fast tests. Default 5s timeout.
- **`explain-the-work.mdc`** — After a task, explain in everyday words, then files and why, then test commands.
- **`mandatory-project-docs.mdc`** — Which `docs/` files to read before implementing (by task type).
- **`docs-this-project-only.mdc`** — Docs describe this project only.
- **`mandatory-checks-before-coding.mdc`** — Pre-flight checklist; includes mandatory docs step.
- **`code-organization-and-style.mdc`** — Structure, components, hooks, imports.
- **`base-developer.mdc`**, **`no-inference-no-guessing.mdc`**, **`write-full-sentences.mdc`**, **`fix-linting-errors.mdc`**, and other global conventions.

## Scoped by path (only when matching files are in play)

- **`apps/mobile-app/**`** — `mobile-view-usage.mdc`, `mobile-screen-spacing.mdc`, `mobile-installed-ui.mdc`.
- **`**/*.md`**, **`**/*.mdc`** — `markdown-no-tables.mdc`.
- **`apps/**/*`, `packages/**/*`, `convex/**/*`** — `official-documentation.mdc` (prefer framework @Docs).

## ESLint

- Inside **`components/`**: no `@/components/...` (relative paths for components).
- **Barrels only** for `@/constants`, `@/hooks`, `@/utils`, `shared`. Generated Convex API uses `@convex/_generated/api`.

## Entry point

**`AGENTS.md`** — Stack, official doc URLs, compliance summary.
