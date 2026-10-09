# Tickets — Showlog

Build order for version one. There is no Linear team for this app. This file is the board. Ticket ids are `SHOW-n`. Each ticket has a status line: **Todo**, **In Progress**, or **Done**. Done means merged to `main`.

Implement one ticket at a time on `feature/SHOW-n`. Read with each ticket:

- `docs/product/system-design.md` for tables, functions, and jobs
- `docs/design/screens.md` for the screen
- `docs/design/design-system.md` for colours, type, and spacing
- `docs/product/product-requirements.md` for the flow

A phone slice is not Done unless I can reach it by tapping through the app.

Every ticket follows `.cursor/rules/` and the docs `mandatory-project-docs.mdc` names, with no exceptions. Lint, format check, type check, and tests pass last.

**Where each ticket is tested:**

- **Simulator:** the development app (`com.dmstudios.showlog.dev`) with Metro: `yarn dev:backend` in one terminal, `yarn dev:mobile` in another.
- **iPhone:** the preview app (`com.dmstudios.showlog.staging`). Code reaches it with an update push, no new build. Only alerts (SHOW-12) need the iPhone.

**Before SHOW-1:** one iOS simulator development build and one iOS preview build. Every native package this version needs is already installed, so these two builds last the whole version.

---

## Status now

- SHOW-1: **Done**. SHOW-2: **Done**. SHOW-3: **Done**. SHOW-4: **Done**. SHOW-5: **Done**. SHOW-6: **Done**. SHOW-7: **Done**. SHOW-8: **Done**. SHOW-9: **Done**. SHOW-10 to SHOW-12: **Todo**.

---

## SHOW-1. I can sign in and see the four tabs

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-1`
**Screens:** `screens.md` sections 1, 2, 3 (header only), and 11 (name, email, and Sign out only)

The app opens on Sign in. I create my one account, land on the four tabs, and stay signed in after closing the app.

**How it is built**

- Convex Auth Password is already in `convex/auth.ts`. Add the `createOrUpdateUser` callback that refuses a new user when one exists, with "This app already has an account."
- Routes `(auth)/sign-in.tsx` and `(main-app)/(tabs)/` with Watching, Upcoming, Discover, and My shows. Each tab has its real large title and an empty state. The tab shell replaces the scaffold's name-and-one-line screen.
- `app/index.tsx` sends a signed-out person to sign in and a signed-in person to the tabs.
- Profile route with the account name, the account email, and Sign out (red text, confirm). Opened from the My shows header. Create account asks for a name and saves it on the account.
- Sign-in form with react-hook-form and zod, the same as other forms in this repo.

**Acceptance (yes or no)**

- On a fresh install the app opens on Sign in.
- Create account with a name, an email, and a password lands on Up next.
- A second Create account (another email) is refused with "This app already has an account."
- A wrong password shows "Email or password is wrong."
- Closing and reopening the app keeps me signed in.
- Profile shows my name and my email. Sign out asks to confirm, then returns to Sign in.
- The four tabs are in order Watching, Upcoming, Discover, My shows, with mint for the active tab.
- A Convex test proves the second sign-up is refused.

**Tested on:** simulator. Sign up once there. The same account then works on the iPhone.

**Out of scope:** stats and export (SHOW-11). Alerts switch (SHOW-12). Password reset.

---

## SHOW-2. I can search TVmaze and add a show

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-2`
**Screens:** `screens.md` section 7, and the Search button on Discover (section 5)

**How it is built**

- Tables `shows`, `episodes`, `myShows`, `watchedEpisodes`, and `userStats` from `system-design.md` section 5. `watchedEpisodes` and `userStats` stay empty until SHOW-4. They go in now so the schema is whole.
- `convex/tvmaze.ts`: `fetchJson` with the User-Agent and 429 retry, and the copy helpers (strip HTML, header picture, drop specials, `order`, `airsAt`, `airTimeKnown`, `seasons`, `yearSeasons`).
- `search.searchShows` action and `shows.add` action, plus the internal mutations that save in batches of 500.
- `convex/progress.ts` with `recomputeProgress`. On add, it sets `airedCount` and the next episode.
- Search screen opened from the Search button on Discover.

**Acceptance (yes or no)**

- Typing "one piece" shows the 1999 Japanese anime on Fuji TV and the 2023 live-action series, each with poster, type, language, year, and network.
- A typo ("brekaing bad") still finds Breaking Bad.
- Add saves the show. The row then reads "On your list". Searching again still shows "On your list".
- Adding One Piece saves all its numbered episodes (over 1,100) without an error.
- Unit tests for the copy helpers: HTML stripped, specials dropped, header picture fallback, `airsAt` with a date and no time, year seasons.
- A Convex test for `recomputeProgress` on a newly added show.

**Tested on:** simulator.

**Out of scope:** opening the show (SHOW-3). My shows grid (SHOW-6).

---

## SHOW-3. I can open a show, on my list or not

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-3`
**Screens:** `screens.md` section 8

**How it is built**

- Route `show/[tvmazeId]/index.tsx`, opened by tapping a search result.
- `shows.get` query for a show on my list. `shows.preview` action for one that is not.
- On my list: header picture, name, seasons and network, progress bar, the season rows from `shows.seasons` with "0/24", About, the TVmaze credit.
- Not on my list: header, name, genres, rating, status, network, number of seasons, summary, and Add. After Add the same screen shows the on-my-list version.
- The Where you left off card shows "Start with S1 | E1" for now. The real card is SHOW-5.
- The menu button shows, with its items wired in SHOW-9.

**Acceptance (yes or no)**

- Tapping a search result opens the show.
- A show on my list shows its seasons with counts. One Piece shows year seasons (1999 to 2026) and opens fast.
- A show not on my list shows the details and Add, and no seasons. Add turns it into the on-my-list version without leaving the screen.
- "Show data from TVmaze" links to the show on tvmaze.com.
- The loading state keeps the back and menu buttons and uses skeletons shaped like the header, name, and season rows.

**Tested on:** simulator.

**Out of scope:** opening a season and ticking (SHOW-4). The menu actions (SHOW-9).

---

## SHOW-4. I can open a season and tick episodes

**Status:** Done
**Apps:** phone, Convex, shared
**Branch:** `feature/SHOW-4`
**Screens:** `screens.md` sections 9 and 10

**How it is built**

- Route `show/[tvmazeId]/season/[season].tsx`, opened from a season row.
- `shows.season` query. `watching.tick`, `untick`, `watchSeason`, and `watchUpTo` mutations from `system-design.md` section 7, each updating `userStats` and running `recomputeProgress`.
- Optimistic updates on all four, and a light haptic with `expo-haptics` on tick.
- The episode sheet as a bottom sheet through `BottomSheetsManager`.
- `packages/shared`: the episode label ("S4 | E11", "Episode 1180" and "2026 · E25") and the countdown text ("in 5 days").

**Acceptance (yes or no)**

- Ticking an aired episode fills the tick at once and plays the haptic. Unticking empties it.
- An unaired episode shows the countdown and no tick. The server refuses a tick on it.
- Watch season ticks every aired episode of that season with one shared time.
- Watched up to here (from long-press or the sheet) ticks that episode and every earlier aired one in the show.
- The season row on the show screen updates to "10/24", and the show's progress bar moves.
- One Piece reads "Episode 1180" with "2026 · E25" under it.
- Convex tests: tick twice saves one row, untick, watch season, watch up to here, refuse unaired, and the progress fields after each. Shared tests for the label and countdown.

**Tested on:** simulator.

**Out of scope:** Up next (SHOW-5).

---

## SHOW-5. Up next shows what to watch, and the show remembers where I left off

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-5`
**Screens:** `screens.md` sections 3 and 8 (Where you left off)

**How it is built**

- `lists.upNext` query with the three sections. The Up next tab rows with the tick button and "+N".
- The Where you left off card on the show screen, from the `lastWatchedEpisodeId` and `nextEpisodeId` progress fields.
- The hourly clock job (`convex/crons.ts`, `clock.hourly` steps 1 and 2): recompute progress for shows with an episode that aired in the last hour. Alerts are added to this job in SHOW-12.
- Empty Up next with the Discover button. Discover opens the Discover tab, which is still empty until SHOW-10. Search stays on Discover.

**Acceptance (yes or no)**

- Every show with an aired, unticked episode has one row, and not Watch later or Stopped shows.
- Ticking on the row moves it to the next episode. When nothing is left, the row leaves.
- Shows watched in the last 30 days come first, newest first. Older ones sit under Paused for a while. Added but never ticked sit under Not started.
- "+3" shows when three more aired episodes wait after the next one, and is hidden at zero.
- The show screen's Where you left off card shows the last ticked episode with the date and summary, then the next episode with a tick button.
- A Convex test runs the hourly job with a fake clock and sees a just-aired episode become the next episode.

**Tested on:** simulator.

**Out of scope:** alerts (SHOW-12).

---

## SHOW-6. My shows is a poster grid I can sort and filter

**Status:** Done
**Apps:** phone, Convex, shared
**Branch:** `feature/SHOW-6`
**Screens:** `screens.md` section 6

**How it is built**

- `lists.myShows` query with sort. Filter on the phone.
- Show status in `packages/shared` from `system-design.md` section 6.
- The sort and filter sheet with `@expo/ui`. The choice saved with Zustand and AsyncStorage.
- Tapping a poster opens the show. There is no search on this tab.

**Acceptance (yes or no)**

- Every show on my list is in a three-column grid with a mint progress bar.
- Sort by Last watched, Last added, and A to Z works.
- Each filter shows only shows with that status. Watch later and Stopped show none until SHOW-9.
- The choice is still set after closing the app.
- Shared tests for every status.

**Tested on:** simulator.

---

## SHOW-7. TVmaze changes reach the app within a day

**Status:** Done
**Apps:** Convex
**Branch:** `feature/SHOW-7`

**How it is built**

- `refresh.daily` cron from `system-design.md` section 8, steps 1 to 3. The premiere alert (step 4) is added in SHOW-12.
- Updated episodes are changed, new ones added, removed ones deleted along with their ticks, and `userStats` corrected.

**Acceptance (yes or no)**

- Running `npx convex run refresh:daily` updates a show on my list that TVmaze changed today and skips the rest.
- A new episode from TVmaze appears in the season list.
- A Convex test with a fake TVmaze reply covers added, changed, and removed episodes, including a removed one I had ticked.

**Tested on:** simulator, after running the job by hand.

---

## SHOW-8. Upcoming lists what airs next

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-8`
**Screens:** `screens.md` section 4

**How it is built**

- `lists.upcoming({ now })` query. The phone passes the time rounded down to the hour.
- Day grouping in `packages/shared`, using the phone's time zone. Today, Tomorrow, and the rest of this week by day name. Each later day is its own heading, the date.

**Acceptance (yes or no)**

- Episodes of my shows that have not aired are grouped Today, Tomorrow, the rest of this week by day name, then one heading per later day with that date.
- Each row shows the air time in phone time. An episode with a date and no time shows "Time TBA". The network is on the show screen.
- Episode 1 of a season shows Premiere.
- Shows with nothing scheduled are under No date yet. Ended shows and Stopped shows are not listed.
- Shared tests for the grouping across midnight and the week edge.

**Tested on:** simulator.

---

## SHOW-9. I can put a show on Watch later, stop it, or remove it

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-9`
**Screens:** `screens.md` section 8 (menu)

**How it is built**

- The show menu with `@expo/ui`: Watch later or Remove from Watch later, Stop watching or Resume, Remove from my list.
- `shows.setWatchLater`, `stop`, `resume`, and `remove` mutations.

**Acceptance (yes or no)**

- Watch later takes the show out of Up next. It stays in Upcoming. Ticking any episode clears it.
- Stop watching takes the show out of Up next and Upcoming and keeps its ticks. Resume brings it back.
- Remove from my list asks to confirm, then deletes the show and my ticks, and the stats drop by those ticks.
- Stop watching and Remove are red text.
- The Watch later and Stopped filters in My shows now show these shows.
- A Watch later progress bar is blue. A stopped progress bar is red, and on the show screen the percentage reads Stopped.
- Convex tests for each action.

**Tested on:** simulator.

---

## SHOW-10. Discover suggests shows I may like

**Status:** Todo
**Apps:** phone, Convex
**Branch:** `feature/SHOW-10`
**Screens:** `screens.md` section 5

**How it is built**

- Table `suggestedShows` and the weekly `discover.refreshPool` cron from `system-design.md` section 8.
- Run the pool once by hand on the dev deployment so Discover is not empty: `npx convex run discover:refreshPool`.
- `discover.rows` query. The phone picks 20 at random from each row's 100 and reshuffles on open and pull down.
- Add from the card uses `shows.add`. Tapping the poster opens the show.

**Acceptance (yes or no)**

- With no shows on my list, the rows are Popular anime, Popular right now, and Top rated.
- With shows on my list, the rows are Because you watch anime (only with anime on my list), More of my two most common genres, and Top rated. Shows on my list are left out.
- Add on a card saves the show and the card reads "Added".
- Pulling down changes the shows in each row.
- The pool has only shows with a popularity of 85 or more and a poster.
- A Convex test for the row rules and for the anime check (Anime genre, or Japanese animation).

**Tested on:** simulator.

---

## SHOW-11. Profile shows my stats and I can export my history

**Status:** Todo
**Apps:** phone, Convex, shared
**Branch:** `feature/SHOW-11`
**Screens:** `screens.md` section 11

**How it is built**

- `profile.stats` query from `userStats`. TV time as months, days, and hours in `packages/shared` (a month is 30 days).
- `profile.exportHistory` action. The phone writes `showlog-history-YYYY-MM-DD.json` with `expo-file-system` and opens the share sheet with `expo-sharing`.
- "Show data from TVmaze" with a link and the app version on Profile.

**Acceptance (yes or no)**

- Profile shows episodes watched and TV time, matching my ticks. A missing runtime uses the show's average, or zero.
- Export opens the share sheet and Save to Files writes one JSON file with every show (added time, status) and every watched episode (show, season, number, title, watched time).
- Shared tests for the TV time format.

**Tested on:** simulator for stats. The iPhone for Save to Files.

**Out of scope:** the Alerts switch and phone alerts (SHOW-12).

---

## SHOW-12. I get a phone alert when a new episode is out

**Status:** Todo
**Apps:** phone, Convex
**Branch:** `feature/SHOW-12`
**Screens:** `screens.md` sections 11 (Alerts switch) and 12

**First, by Delasi (once):** add the Apple push key to the Expo project. Follow `project-template/docs/client-delivery/push-notifications-setup.md`, the iPhone (Apple) part only. No Firebase. The ticket cannot be tested until this is done.

**How it is built**

- Tables `pushTokens` and `pendingAlerts`. `alerts.saveToken`, `setAlertsOn`, and `settings`.
- The Before alerts screen, shown once after the first show is added. Allow asks the iPhone permission, gets the Expo push token, and saves it with the phone's time zone.
- `clock.hourly` steps 3 to 5 and `refresh.daily` step 4 from `system-design.md` section 8. Quiet hours in `packages/shared`.
- Tapping an alert opens the show, also from a fully closed app.
- The Alerts switch on Profile.

**Acceptance (yes or no)**

- After allowing, a test alert sent from the Convex dashboard (`alerts:sendTest`) arrives on the iPhone.
- A new episode of a show I watch sends "New episode of The Bear: S4 | E1." within the hour.
- A whole season dropped at once sends one alert for the show.
- Nothing arrives between 22:00 and 08:00 my time. Held alerts arrive at 08:00.
- A new premiere date sends "Severance season 3 premieres 12 January."
- Watch later shows get premiere alerts and no episode alerts. Stopped shows get none.
- Tapping an alert opens that show, from the background and from a closed app.
- Turning Alerts off stops all alerts.
- Shared tests for quiet hours at 21:59, 22:00, 07:59, and 08:00 in Accra time. Convex tests for grouping a season drop and for skipping Stopped shows.

**Tested on:** the preview app on the iPhone, after an update push. The simulator cannot receive push alerts.

---

## Related docs

- `docs/product/locked-decisions.md`
- `docs/product/product-requirements.md`
- `docs/product/system-design.md`
- `docs/design/screens.md`
- `docs/design/design-system.md`
