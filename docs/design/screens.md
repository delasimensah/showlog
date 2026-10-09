# Screens — Showlog

**Status:** written 8 Oct 2026. Follows `docs/design/design-system.md` (mint on ink, Plus Jakarta Sans) and `docs/product/product-requirements.md`.

Each screen lists its layout, content, loading, empty, and error states, and the references it follows. TV Time screenshots are in `docs/design/references/tvtime/`. Mobbin links open the screen on Mobbin. Only the layout idea is taken from a reference, never its colours or logo.

Shared rules for every screen:

- Background `page`. Screen edges 20.
- A screen title is a large title (34, ExtraBold) that shrinks into the nav bar on scroll (`ScreenWithAnimatedHeader`).
- While data loads, the title, buttons, search field, and section headings stay. Only the rows that wait for data show skeletons, in the same shape as the loaded rows.
- **Skeletons** are built from `SkeletonCard` (shimmer from `surface` to `border`). Each screen has its own `*ScreenSkeleton` component that uses the same row components' padding, gaps, and column tracks as the loaded screen, so nothing jumps when data arrives:
  - Each picture is a block of the exact size, shape, and radius of the real one (posters 2:3 radius 10, episode pictures 16:9).
  - Each text line is a bar as tall as that text's cap height (about 14 for 17-point text, 11 for 15, 9 for 13 and 12), with the same gap between lines as the loaded text.
  - Bar widths differ from row to row (for example 70%, 55%, 80%, 62%, 48%), so the list does not read as a stack of identical bars.
  - Round things stay round: the tick circle, the Add button, and chips are skeletons of their own shape and size.
  - The number of skeleton rows fills the visible screen at 430 wide and no more.
- A failed load shows the row area as "Could not load. Pull down to try again." The title and buttons stay.
- Destructive actions (Remove from my list, Stop watching, Sign out) are red text, button tone `quietDanger`.
- iPhone only, portrait. Check at the iPhone SE width (375) and the iPhone Pro Max width (430), with a long show name and a year-season show (One Piece).
- Every element in a screen's spec is built. Before a screen is called done, screenshot it on the simulator and compare it with its spec and references.

---

## Shared parts

Every screen is built from these. One component each, used the same way everywhere, so Showlog reads as one app. A screen spec below names the part and does not restate its size. If a screen seems to need a variant, the variant is added here first.

**Text roles** (Plus Jakarta Sans, from the design system):

- Screen title: 34, ExtraBold. Hero title (show name on the show screen, Before alerts headline): 28, ExtraBold.
- Section heading (Up next sections, Upcoming day groups, Discover rows, Seasons, About): 20, SemiBold, 12 above the first row.
- Row title (the show name in Up next and Upcoming cards): 15, Bold, one line. Search rows and the episode title in Season rows stay 17, Bold.
- Episode line (`EpisodeLabel`): 13, SemiBold, mint. "S4 | E11", or "Episode 1180" with "2026 · E25" as a meta line under the title.
- Meta line: 13, Medium, muted. Parts joined with " · ".
- Poster label (under a poster in Discover and My shows): 13, SemiBold, text colour. Two lines in Discover, one in My shows.
- Body (summaries): 15, Regular, line height 22.

**Dates and times:** `formatDate` and `formatAirTime` in `packages/shared`, used on every screen.

- Dates: "12 Mar" in the current year, "12 Mar 2025" otherwise.
- Times: the phone's own 12 or 24-hour setting.
- Relative: "7 months ago", "in 5 days", "Today", "Tomorrow", day names this week.

**Pictures:** `expo-image`, radius 10 for every poster and episode picture, `surface` behind while loading, a fade-in of 150 ms. When a picture is missing, the fallback is the TV mark in muted on `surface`, never an empty box.

- `Poster`: 2:3. Sizes: small 48 × 72 (Upcoming, Search), medium 120 × 180 (Discover), grid (a third of the row width, My shows).
- `EpisodeImage`: 16:9, 128 × 72 in Up next, Upcoming, and Season rows, full width in the episode sheet. Falls back to the show's header picture, then the poster, then the TV mark.

**Controls:**

- `TickButton`: 40 circle, mint outline, mint tick. Watched: mint fill, ink tick. Light haptic on tap. Up next, the Where you left off card, and Season rows use this one.
- `AddButton`: 32 circle, `surface`, mint plus. Added: mint fill, ink tick, the same as a watched `TickButton`. Discover cards (on the poster's bottom right) and Search rows (on the right) use this one. The show screen uses the full-width primary `Button` "Add to my list" instead, because there it is the page's main action.
- `HeaderButton`: 36 circle, `surface`, an 18 Ionicons icon in text colour. Sort and filter uses this until that control is a system bar button. Profile, search on Discover, and a back or close control are the system bar buttons. That bar is the iPhone's liquid glass bar. Do not draw those.
- `Button`: primary (mint, ink text), secondary (`surface`, text colour), `quietDanger` (red text, no fill). Height 50, fully rounded, Bold 16.
- `Chip`: 22 tall, fully rounded, `surface`, 12 SemiBold. "+3" and genres in text colour, Premiere in mint.
- `ProgressBar`: 6 tall, fully rounded, mint on `surface`. My shows grid, the show header, and Season rows on the show screen.
- Pressed state on everything tappable: opacity 0.7 on rows and text buttons, scale 0.96 on circles.

**Rows and spacing:**

- List rows: 12 between the picture and the text, 16 between rows, no hairlines. The text column is centred on the picture.
- Cards (Where you left off, stat tiles, the example alert): `surface`, radius 16, padding 16.
- Bottom padding on every tab screen clears the floating tab bar, so the last row is never hidden.

**States:**

- `EmptyState` on every empty list: one muted icon (48) for that screen, a title (20, Bold), one line in muted, and up to two buttons. That group is centred in the space under the screen title. The page does not scroll. Up next uses a play circle, Upcoming a calendar, Discover a compass, My shows a grid, and Search a magnifying glass. A missing poster still uses the TV mark.
- Error: the same `EmptyState` layout with "Could not load", "Pull down to try again.", and no buttons. Header and buttons stay.
- Toasts (`Toast`): one line, for a refused tick or a failed add.

---

## 1. Sign in

**Route:** `app/(auth)/sign-in.tsx`

**Layout:** centred column. The TV mark (72). One line under it in muted: "Track the shows you watch." Email field, password field, a full-width mint Sign in button, then a text link "Create account".

**Create account:** the same screen, with a Name field above Email. The button reads Create account and the link reads "I already have an account". The name is saved on the account. The server refuses a second account with "This app already has an account.", shown under the button in danger red.

**States:** the button shows a spinner while signing in. Wrong password: "Email or password is wrong." The password field starts hidden. A control on its right shows the characters, and the same control hides them again.

**References:**

- [Savee sign in](https://mobbin.com/screens/3a9b8279-73f9-4c42-a738-9f20b83efbf6): kept for the centred name with one field group and one bold button on black. Nothing else on screen.
- [theScore log in](https://mobbin.com/screens/46a5a9f4-c6e2-41e5-b4e1-a0353e5b5e0a): kept for the labelled dark fields with a hairline border.

---

## 2. Tabs

**Route:** `app/(main-app)/(tabs)/_layout.tsx`

Four tabs, in order: **Watching, Upcoming, Discover, My shows**. The tab bar is the iPhone's own glass tab bar, the system liquid glass bar. Active tab icon and label in mint, inactive in muted. Icons are the system symbols for play, calendar, magnifying glass, and grid.

---

## 3. Watching (tab)

**Route:** `app/(main-app)/(tabs)/up-next/index.tsx`

**Header:** the system navigation bar, title "Watching".

**Sections, in order:** Up next, Paused for a while, Not started. A section heading shows only when it has rows. Each row is its own rounded card (surface colour, radius 16), with a 16 gap between cards.

**Row (one per show):**

- Left: `EpisodeImage`.
- Right of the picture: the row title (show name), the `EpisodeLabel` with a "+3" `Chip` when more episodes wait, then a meta line with the episode title ("Milim's Friend", one line).
- Far right: `TickButton`. Tapping it fills the tick, holds that for a moment, then slides that episode out to the left and the next episode in from the right. The new episode's tick is empty again. When nothing is left, the card slides out with the tick still filled, and the cards below move up.
- Tapping anywhere else on the row opens the show.

Year-season shows read "Episode 1180" on the mint line and "2026 · E25" under the title.

**Empty:** `EmptyState`: "Add the shows you watch", "Find them in Discover.", Discover (primary). No search on this tab.

**Loading:** the title stays. A section heading bar (20 tall, 110 wide), then five separate cards with the same gap as the loaded list. Each card: a 128 × 72 picture block (radius 10); beside it a name bar (11 tall), an episode line bar (9 tall, about 60 wide) with a 28 × 18 chip block beside it on rows 1 and 3, and a title bar (9 tall); a 40 circle at the far right.

**References:**

- TV Time `01-watch-list.jpg`: the row content (picture, name, "S01 | E08 +1", title, tick) is the layout I already know.
- [HBO Max continue watching](https://mobbin.com/screens/8a0e6ce9-12df-4405-9130-412b3e2c2eed): kept for the calm dark rows with the picture left and text right, no card borders.
- [Netflix downloads list](https://mobbin.com/screens/7d69c8cd-79ee-47c6-8452-5722358be10e): kept for a single action on the far right of an episode row.

---

## 4. Upcoming (tab)

**Route:** `app/(main-app)/(tabs)/upcoming/index.tsx`

**Header:** the system navigation bar, title "Upcoming".

**Groups** (section headings): Today, Tomorrow, each remaining day of this week by name ("Friday"), then one heading per later day, the date itself ("19 Oct", plus the year when it is not this year). Then "No date yet" at the bottom. Today, Tomorrow, and a weekday show that date ("9 Oct", 13, Medium, meta colour) at the right end of the heading. A heading that is already the date, and No date yet, do not repeat it. Each row is its own rounded card (surface colour, radius 16), with a 16 gap between cards, the same card as Up next.

**Row:** `EpisodeImage` (the episode picture, then the show's header picture, then the poster), the row title (show name, one line), the `EpisodeLabel`, and a meta line with the episode title. Episode 1 of a season shows a Premiere `Chip` after the label. Right side, right-aligned: the air time (13, SemiBold, text colour). An episode with a date and no time shows "Time TBA". The network stays on the show screen.

**No date yet rows:** the same card and `EpisodeImage` (the show's header picture, then the poster), the row title, and "Waiting for an air date" as the meta line. Ended shows are not listed.

**Empty:** `EmptyState`: "Nothing scheduled yet", "Nothing scheduled for your shows yet.", no buttons.

**Loading:** the title stays. Two groups of three separate cards, with the same gap as the loaded list. Above each group a heading bar (20 tall, 80 wide) with a date bar (9 tall, 44 wide) at the right end. Each card: a 128 × 72 picture block (radius 10), a name bar (11 tall), an episode line bar (9 tall), and a title bar (9 tall), and on the right a time bar (9 tall, 44 wide).

**References:**

- TV Time `04-upcoming-today-later.jpg`: Today and a weekday as headings, then each later day under its own date. The air time stays on the row.
- TV Time `03-upcoming-recent.jpg`: how a dense list of episodes reads in day groups.
- [Plex upcoming airings](https://mobbin.com/screens/d8575cec-b063-456a-8ee2-2fddb6585021): kept for the plain two-line row ("Today at 19:40 on Plex") with no decoration.

---

## 5. Discover (tab)

**Route:** `app/(main-app)/(tabs)/discover/index.tsx`

**Header:** the system navigation bar, title "Discover". The search control is the system bar button on the right (magnifying glass). It opens Search.

**Rows:** each row has a section heading and a horizontal list of 20 cards, 12 apart, starting at the screen edge inset. Before I add any shows: Popular anime, Popular right now, Top rated. After: Because you watch anime (only when anime is on my list), More Drama and More Comedy (my two most common genres), Top rated.

**Card:** medium `Poster` with an `AddButton` 8 in from its bottom right. Under it the poster label (two lines) and the year as a meta line. After adding, the meta line reads "Added".

**Behaviour:** tapping the poster opens the show. Opening the tab or pulling down reshuffles every row.

**Loading:** the title and search button stay. Three rows, each with a heading bar (20 tall, 140 wide) and four cards: a 120 × 180 poster block (radius 10) with a 32 circle 8 in from its bottom right, then a two-line name (two 9-tall bars, the second shorter) and a year bar (9 tall, 32 wide). The fourth card is cut off at the screen edge, the same as the loaded row.

**References:**

- [Paramount+ shows](https://mobbin.com/screens/a589fbb1-5795-4dcc-8b39-3160ceaa2e9c): kept for stacked rows of posters under short headings.
- [HBO Max comedy rows](https://mobbin.com/screens/d86763e5-6ad3-4eeb-9ac0-4fba110645cd): kept for the poster size and a small action on each poster.

---

## 6. My shows (tab)

**Route:** `app/(main-app)/(tabs)/my-shows/index.tsx`

**Header:** the system navigation bar, title "My shows". The profile control is the system bar button on the right. It opens Profile. Sort and filter is a second system bar button when the grid is on screen. No search. A new show is found on Discover.

**Grid:** three columns, gap 12. Grid `Poster`, then a `ProgressBar` 8 below it (episodes ticked out of episodes aired), then the poster label (one line) 6 below the bar. A normal bar is mint. Watch later is blue. Stopped is red.

**Sort and filter sheet** (native sheet from `@expo/ui`): Sort by Last watched, Last added, A to Z. Filter by All, Watching, Up to date, Not started, Watch later, Finished, Stopped. The choice is saved on the phone. The header shows the filter name when it is not All ("Watching · 12").

**Empty:** `EmptyState`: "Your list is empty", "Find a show in Discover.", Discover (primary). With a filter and no matches: `EmptyState` "No Finished shows", "Shows you finish show up here.", no buttons (the filter name changes with the filter).

**Loading:** the title and the sort and filter button stay. A three-column grid of twelve cells with the same gap as the loaded grid: a 2:3 poster block (radius 10), a 6-tall progress bar block, and a name bar (9 tall, width varying by cell).

**References:**

- TV Time `06-my-shows-grid.jpg`: the three-column grid with a progress bar under each poster.
- TV Time `07-my-shows-sort-filter.jpg`: the sort and filter choices.
- [Plex binge-worthy grid](https://mobbin.com/screens/cfb6bf8b-c2e1-42c9-82a9-c8370b1a6677): kept for the short label under each poster in a three-across grid.

---

## 7. Search

**Route:** `app/(main-app)/search.tsx`, pushed from the search button on Discover.

**Layout:** the system search field. It opens low, then moves up as soon as the screen has finished opening, with the keyboard up and the system x beside it. The x leaves the screen, so I never have to tap the field first. There is no back button and no second x in the top bar. Results start after 2 characters, 300 ms after typing stops.

**Result row:** small `Poster`, the row title, and the meta line "Animation · Japanese · 1999 · Fuji TV". Right side: `AddButton`, shown as added when the show is on my list. The list is live: a show added on its own screen shows as added here when I come back. Tapping the row opens the show.

**States:** before typing: `EmptyState` "Search for a show", "Type a name. Show data comes from TVmaze.". No results: `EmptyState` "No matches", "No shows match "query"." Searching: the system search field stays, and the current results stay until new ones arrive. On the first search, four rows under the field: a 48 × 72 poster block (radius 10), a name bar (14 tall), a meta bar (9 tall, about 70%), and on the right a 32 circle where the `AddButton` goes.

**References:**

- [Apple TV search](https://mobbin.com/screens/27acacd0-015c-4599-af2e-ed3f737e29bf): kept for the list of poster, name, and "TV Show · Thriller" rows under a top search field.
- [Letterboxd search](https://mobbin.com/screens/c555bcf3-26c9-4258-b124-209831d61bff): kept for the year beside the name and the add action on the right, which is how to tell two shows with the same name apart.

---

## 8. Show

**Route:** `app/(main-app)/show/[tvmazeId]/index.tsx`

**On my list:**

- Header picture full width, 16:10, with a dark fade into `page` over its lower half. The show name sits on that fade, up to two lines. Pulling down stretches the picture. Scrolling up fades `page` into the system navigation bar, and the show name fades in with it, centred on the bar, on one line, ending in an ellipsis when it does not fit. The system back button sits in the navigation bar. The menu button (ellipsis) sits on the right only once the menu below exists. A poster used in place of a wide picture stays 2:3 and centred in the header, so it is not stretched.
- Hero title (show name, up to two lines), then the meta line "5 seasons · Netflix", then a progress summary: "48 of 73 watched" (meta line) on the left, the percentage in mint on the right, and a full-width `ProgressBar` under them. When the show is on Watch later, the bar and the percentage are blue. When it is stopped, the percentage reads Stopped in red and the bar is red.
- **Where you left off** card: the meta line "Last watched · 12 Mar" (12), the `EpisodeLabel` (12), the episode title (15, Bold), and TVmaze's summary (13, three lines). Lines sit 8 apart. Under a `border` hairline: "Up next" (meta line), the next `EpisodeLabel` and title, and a `TickButton` on the right. With nothing ticked: a mint play circle (36) on the left, "Start with S1 | E1" (15, Bold), "Nothing watched yet" as a meta line, and the `TickButton`. Tapping an episode in the card opens the episode sheet.
- **Seasons** (section heading, the season count in muted beside it): one `surface` card, radius 16, with a hairline between rows. Each row: "Season 4" (or "2026" for year seasons, 17, Bold) with "10/24" beside it as a meta line (a mint check circle when every episode is watched). The chevron stays at the far end. A `ProgressBar` sits under them. Tapping opens the season.
- **About** (section heading): summary (body, four lines, "More" in mint expands it, "Less" closes it), genre `Chip`s, and "Show data from TVmaze" as a meta line with a link. 16 between the heading, the summary, the chips, and the link. 8 between the summary and More.
- **Menu** (native menu from `@expo/ui`): Watch later (or Remove from Watch later), Stop watching (red) or Resume, Remove from my list (red). Remove asks to confirm first.

**Not on my list** (opened from Discover or Search):

- The same header and name. One meta line: "2 seasons · Netflix · Running · Rated 8.7". Genre `Chip`s wrap under it.
- A full-width primary `Button` "Add to my list".
- **About**: the summary (body, four lines, "More" expands it). A short summary has no More.
- "Show data from TVmaze". No seasons until the show is added. After Add, the screen becomes the on-my-list version.

**Loading:** the system back button and the menu button stay.

- A 16:10 header block, full width.
- A name bar (22 tall, 70%), a meta bar (9 tall, 40%), and a progress bar block (6 tall) with a count bar on its right.
- The Where you left off card as a `surface` card of the loaded size, with a label bar, an episode line bar, a title bar, three summary bars, a hairline, and a 40 circle.
- Four season rows: a season name bar, a count bar, a thin progress block, and the chevron as a small block.
- A show not on my list instead shows a full-width 50-tall pill block where Add goes, three chip blocks, and four summary bars.

**References:**

- TV Time `10-show-about.jpg`: header picture, name, seasons and network, progress bar.
- TV Time `11-show-episodes-seasons.jpg` and `16-show-continue-tracking.jpg`: seasons with "10/24" and the continue card.
- TV Time `14-show-menu.jpg`: the menu with Watch later, Stop watching, Remove.
- [Google TV show page](https://mobbin.com/screens/7184229d-9722-44f4-afec-f8617bbb6c04): kept for the large name over a faded header picture, and one wide main button.
- [IMDb series page](https://mobbin.com/screens/19345c55-b7ea-43ef-a5a1-7a6e125e9200): kept for the genre chips and the compact meta line under the name.

---

## 9. Season

**Route:** `app/(main-app)/show/[tvmazeId]/season/[season].tsx`

**Header:** the system navigation bar. The system back button, then the screen title "Season 4" (or "2026") with the show name as a meta line under it. Both lines stay on one line. A long show name ends in an ellipsis before the Watch season button. A "Watch season" text button (15, Bold, mint) at the top right ticks every aired episode in the season. It reads "Season watched" in muted when nothing is left.

**Episode row:**

- Left: `EpisodeImage`.
- The `EpisodeLabel`, the row title (episode title, two lines), and the air date as a meta line ("14 Jan", or "2026 · E25 · 14 Jan" for year seasons).
- Right side: `TickButton`. An unaired episode shows the countdown ("in 5 days", or the date when more than 30 days away, 13, SemiBold, muted) in the tick's place, and its picture at 50% opacity.
- Tapping the row opens the episode sheet. Long-press shows a native menu with Watched up to here.

**Loading:** the header, the show name, and Watch season stay. Six episode rows: a 128 × 72 picture block (radius 10), an episode line bar (9 tall, about 60 wide), a two-line title (two 14-tall bars, the second shorter), a date bar (9 tall, about 72 wide), and a 40 circle on the right.

**References:**

- TV Time `12-season-episodes.jpg`: the episode row with picture, number, title, and tick.
- TV Time `13-season-unaired.jpg`: the countdown in place of the tick.
- [Google TV season list](https://mobbin.com/screens/d2f2aad3-8950-4980-9f3c-dfb11b25bf35): kept for the clean episode rows ("S2E1 · Jan 14, 2026") and the dimmed unaired episodes.

---

## 10. Episode sheet

**Opens from:** an episode row in a season, and from the Where you left off card.

**Layout** (bottom sheet, radius 16 at the top, `surface`, padding 20): full-width `EpisodeImage`. The `EpisodeLabel`, the episode title (20, Bold), and the meta line "Aired 14 Jan · 52 min". The summary (body). A full-width `Button`: primary "Mark as watched", or secondary "Watched · tap to undo" when ticked. Under it a text button "Watched up to here" (15, Bold, mint).

Unaired: no buttons. "Airs Friday 21:00" instead.

**References:**

- TV Time `12-season-episodes.jpg`: the episode content.
- [HBO Max season picker sheet](https://mobbin.com/screens/3775c588-3e4b-4523-9d58-f2d3927dacda): kept for a dark sheet over the list that keeps the list visible behind it.

---

## 11. Profile

**Route:** `app/(main-app)/profile.tsx`, pushed from the My shows header.

**Layout:**

- The system navigation bar. The system back button, and the screen title "Profile".
- Two stat cards side by side, equal width: **TV time** with "8 months 1 day 12 hours" (numbers 28 ExtraBold, units 13 Medium muted), and **Episodes watched** with "9,629". The label (13, Medium, muted) sits above the number.
- Settings card: rows 52 tall with `border` hairlines between them. Name (the name on the right in muted), Account (email on the right in muted), Alerts (native switch from `@expo/ui`), Export my history (chevron). Export opens the share sheet with the JSON file.
- "Show data from TVmaze" with a link and "Version 1.0.0", both meta lines, centred.
- Sign out as a full-width `quietDanger` `Button`. It asks to confirm.

**Loading:** the title, the stat labels (TV time, Episodes watched), and every settings row stay. Only the numbers wait: a bar 22 tall in each stat tile, the TV time bar about 160 wide and the episodes bar about 80 wide. The name and the email each show a bar 11 tall, about 150 wide.

**References:**

- TV Time `08-profile-stats.jpg`: the TV time and episodes watched stats.
- [Plex profile stats](https://mobbin.com/screens/1995030a-e7f0-4cf8-b1bf-10f0fcbe91ea): kept for large numbers with small unit labels in quiet tiles.

---

## 12. Before alerts

**Route:** `app/(main-app)/alerts-intro.tsx`, shown once after the first show is added, and from the Alerts switch when permission was never asked.

**Layout:** the TV mark (72), then the hero title "Know when it's out", then "Showlog tells you when a new episode of your shows is out, and when a new season gets a date." (body, muted). An example alert card: the app icon (24), "Showlog" and "now" as a meta line, then "New episode of The Bear: S4 | E1". At the bottom: a full-width primary `Button` "Allow alerts" (opens the iPhone prompt) and a text button "Not now" (15, Bold, muted).

**References:**

- [Peloton allow notifications](https://mobbin.com/screens/d030c568-4577-46b8-a3e1-1ff84fc8e317): kept for the left-aligned headline, one plain line, a sample alert, and Turn on with Maybe later at the bottom.

---

## Reference images

Mobbin links above open each screen on Mobbin. TV Time screenshots are listed in `references/tvtime/README.md`.
