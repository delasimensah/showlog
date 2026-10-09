# Design system — Showlog (locked)

**Status:** locked 8 Oct 2026. Mint on ink. Change only when a ticket says so.

Chosen from the previews in [palette-previews/](./palette-previews/): `ink-accents.png`, option C. The earlier options (plum night, graphite violet, ink and lime, coral, electric blue, rose) were rejected and stay there as a record.

Mobbin references for the direction: [HBO Max continue watching](https://mobbin.com/screens/8a0e6ce9-12df-4405-9130-412b3e2c2eed) and [Plex profile stats](https://mobbin.com/screens/1995030a-e7f0-4cf8-b1bf-10f0fcbe91ea). The interface stays dark and quiet. The posters bring the colour.

Tokens live in `packages/shared/src/constants/colors.ts` and the Tailwind theme in `apps/mobile-app/tailwind.config.js`. Use the token names below. Never a hex in a component.

---

## Colours

**Source:** [Coolors — 0e0e10 1c1c1f 8a8a8d 3ddc97 f5f5f5](https://coolors.co/0e0e10-1c1c1f-8a8a8d-3ddc97-f5f5f5)

- **page** `#0e0e10` — every screen background, the splash screen, and the app icon background.
- **surface** `#1c1c1f` — cards, sheets, the tab bar, chips such as "+3", and the empty part of a progress bar.
- **border** `#2a2a2e` — hairlines between rows and the skeleton shimmer highlight. A grey between surface and text, not a brand colour.
- **text** `#f5f5f5` — titles and body text.
- **muted** `#8a8a8d` — episode titles, dates, counts, inactive tabs.
- **primary** `#3ddc97` (mint) — the watched tick, a normal progress bar, the episode number line, the active tab, main buttons, links.
- **onPrimary** `#0e0e10` — text and icons on a mint button.
- **later** `#0a84ff` — the progress bar when a show is on Watch later. iOS system blue in dark mode.
- **danger** `#ff453a` — iOS system red in dark mode. The progress bar when a show is stopped, and actions that take something away: Remove from my list, Stop watching, Sign out. Those actions are red text on a transparent button, never a filled red button.

Mint means "watched" or "do this". Do not use it for decoration.

---

## Typography

**Plus Jakarta Sans**, one family for the whole app. Source: [Google Fonts — Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans). Licence: SIL Open Font License, free to ship in an app. Loaded from `@expo-google-fonts/plus-jakarta-sans`.

Weights and the Tailwind class for each:

- Regular 400 — `font-app-regular` — body text, summaries
- Medium 500 — `font-app-medium` — episode titles, meta lines, tab labels
- SemiBold 600 — `font-app-semibold` — episode numbers ("S4 | E11"), chips, section headings
- Bold 700 — `font-app-bold` — show names, buttons
- ExtraBold 800 — `font-app-extrabold` — screen titles ("Up next") and big stat numbers

Sizes:

- Screen title: 34, ExtraBold
- Navigation bar title: 17, Bold
- Section heading: 20, SemiBold
- Show name in a row: 17, Bold
- Body: 15–16, Regular
- Meta and episode lines: 13, Medium or SemiBold
- Tab labels and chips: 11–12

---

## Layout

- **Screen edges:** 20 left and right.
- **Spacing:** 8 inside a row, 12 between a poster and its text, 16–20 between rows, 24–32 between sections.
- **Posters:** 2:3 shape. 48 × 72 in Upcoming and Search rows, 120 × 180 in Discover, three across in the My shows grid. Up next and Season rows use the 16:9 episode picture (128 × 72) instead. Sizes for every shared part are in `screens.md`, Shared parts.
- **Corner radius:** every poster and episode picture 10, cards and sheets 16, chips and buttons fully rounded, the tab bar fully rounded and floating.
- **Shadows:** none. Depth comes from surface on page.
- **Touch targets:** at least 44.
- **Tick button:** a 40 circle with a mint outline and a mint tick. Tapping it fills the circle mint with an ink tick and plays a light haptic.

---

## Differentiator (exactly one)

**Mint means you are watching.** A normal progress bar is mint. Watch later is blue. Stopped is red. Everything else stays ink and grey.

---

## Anti-style

- No TV Time yellow, logo, or name.
- No purple, plum, or violet (rejected).
- No lime (rejected).
- No coral or rose accents. They read as the red of a destructive action.
- No gradients on the page, no glow effects, and no glassy blur painted in the app. The tab bar and the navigation bar are the iPhone's own glass.
- No light mode in this version.
- No grey boxes where a poster should be. While a poster loads, its skeleton keeps the 2:3 shape.
- No emoji in the interface.

---

## Navigation

Four tabs: **Watching, Upcoming, Discover, My shows**. The tab bar is the iPhone's own glass tab bar. A pushed screen uses the iPhone's glass navigation bar, and its back button is the system's. Profile opens from a button at the top right of My shows. Search opens from Discover. Watching and My shows are shows already on the list. Discover's tab icon is a magnifying glass.

---

## Product-specific

- Episode label: "S4 | E11". For shows with year-numbered seasons (One Piece): "Episode 1180" on the first line, then "2026 · E25".
- "+N" chip on a row when more than one aired episode is unwatched (N = unwatched minus one).
- TVmaze credit "Show data from TVmaze" in muted text with a link, on the show screen and on Profile.
- App icon: the TV-and-episode-bars mark on page `#0e0e10` with the mark in mint `#3ddc97`. Made with SnapAI after this lock.
