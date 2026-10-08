# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or "next" changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Showlog. Personal iPhone app for tracking TV shows. No client, no invoice, not published.
- **Backend:** Convex (dev deployment only, team `dm-studios`)
- **Outcome:** B (studio accounts)
- **Current phase:** Scaffold done. iPhone app (Expo SDK 57), shared package, and a thin Convex start (Convex Auth tables and routes, signed-in function wrappers). First screen is the name and one line. Native packages for this version are installed. Lint, format, type-check, and tests pass. Private GitHub repo created, one commit on `main`.
- **Last updated:** 2026-10-08
- **Blocked / open:** The Convex type files in `convex/_generated/` are placeholders until the first `yarn dev:backend` regenerates them at the Convex cloud step.

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
- [ ] Expo / EAS (`@dm-studios/showlog`): `eas init`, then `extra.eas.projectId` and `updates.url` in `app.config.ts`
- [x] Slack: not used.
- [ ] Backend cloud (Convex) plus auth env
- [x] Access list (`ACCESS-LIST.md`): OpenAI key location noted
- [x] App icon and splash (SnapAI option 3, mint TV on `#0e0e10`) — `docs/design/icon-candidates/README.md`
- [ ] Apple push key on the Expo project

---

## Product path

- [ ] System design
- [x] Design system locked (8 Oct 2026): mint on ink, Plus Jakarta Sans — `docs/design/design-system.md`. Tokens wired into `packages/shared` colours, the Tailwind theme, and the font loader.
- [ ] Screen design: TV Time screenshots (saved) plus Mobbin, `docs/design/screens.md`. No UX Pilot.
- [ ] Tickets in `docs/product/linear-tickets.md`
- [ ] One development build, one preview build (Plus Jakarta Sans package already installed)
- [ ] Build

---

## Next action (one line)

Expo / EAS: `eas init` for `@dm-studios/showlog`, then add `extra.eas.projectId` and `updates.url` to `app.config.ts`. Then Convex cloud plus auth env.

---

## Pointers

- Lock: `docs/product/locked-decisions.md`
- Questionnaire: `docs/product/questionnaire.md`
- Product requirements: `docs/product/product-requirements.md`
- TV Time references: `docs/design/references/tvtime/README.md`
- Design system: `docs/design/design-system.md`
