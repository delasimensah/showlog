# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or "next" changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Showlog. Personal iPhone app for tracking TV shows. No client, no invoice, not published.
- **Backend:** Convex (dev deployment only, team `dm-studios`)
- **Outcome:** B (studio accounts)
- **Current phase:** Setup done: scaffold, GitHub, Expo, Convex, design system, icon, system design, screens, and tickets SHOW-1 to SHOW-12. Builds next, then SHOW-1. iPhone app (Expo SDK 57), shared package, and a thin Convex start (Convex Auth tables and routes, signed-in function wrappers). First screen is the name and one line. Native packages for this version are installed. Lint, format, type-check, and tests pass. Private GitHub repo on `main`. Branches are deleted automatically after merge. Convex agent guidelines and skills installed (`convex/_generated/ai/guidelines.md`, `.agents/skills/`).
- **Last updated:** 2026-10-08
- **Blocked / open:** Both phone builds are running on Expo (8 Oct 2026). Simulator: https://expo.dev/accounts/dm-studios/projects/showlog/builds/bf5a7b93-ccf6-41d4-8999-41b67c64bdec (in progress). Preview for the iPhone: https://expo.dev/accounts/dm-studios/projects/showlog/builds/21398ded-56e6-4244-ac90-336c5b0a4d0a (queued, waiting for a free build slot). The Apple push key waits for SHOW-11.

---

## Before build

- [x] Discovery
- [x] Questionnaire approved
- [x] Product requirements locked
- [x] Invoice not used. Personal app.

---

## Workshop (tools, not product features)

- [x] Scaffold monorepo (phone app only)
- [x] Private GitHub repo: https://github.com/delasimensah/showlog (first commit on `main`, 8 Oct 2026)
- [x] Linear: not used. Tickets live in `docs/product/linear-tickets.md`.
- [x] Vercel: not used. No website.
- [x] Expo / EAS: https://expo.dev/accounts/dm-studios/projects/showlog (`extra.eas.projectId` and `updates.url` in `app.config.ts`).
- [x] Slack: not used.
- [x] Backend cloud (Convex): project `showlog`, dev deployment synced, URL in local env and EAS development and preview. Auth env set (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL=showlog://`).
- [x] Access list (`ACCESS-LIST.md`): OpenAI key location noted
- [x] App icon and splash (SnapAI option 3, mint TV on `#0e0e10`) — `docs/design/icon-candidates/README.md`
- [x] Apple push key: moved into SHOW-11 (phone alerts) as its first step. Not needed before then.

---

## Product path

- [x] System design (8 Oct 2026) — `docs/product/system-design.md`
- [x] Design system locked (8 Oct 2026): mint on ink, Plus Jakarta Sans — `docs/design/design-system.md`. Tokens wired into `packages/shared` colours, the Tailwind theme, and the font loader.
- [x] Screen design (8 Oct 2026): TV Time screenshots plus Mobbin references for each screen — `docs/design/screens.md`. No UX Pilot.
- [x] Tickets SHOW-1 to SHOW-12 in `docs/product/linear-tickets.md`, all Todo
- [ ] One development build, one preview build — both started 8 Oct 2026, not finished yet (Plus Jakarta Sans package already installed)
- [ ] Build

---

## Next action (one line)

Wait for the simulator and preview builds to finish, install them, then start SHOW-1 on `feature/SHOW-1`.

---

## Pointers

- Lock: `docs/product/locked-decisions.md`
- Questionnaire: `docs/product/questionnaire.md`
- Product requirements: `docs/product/product-requirements.md`
- TV Time references: `docs/design/references/tvtime/README.md`
- Design system: `docs/design/design-system.md`
- System design: `docs/product/system-design.md`
- Screens: `docs/design/screens.md`
- Tickets: `docs/product/linear-tickets.md`
