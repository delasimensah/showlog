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

- SHOW-1: **Done**. SHOW-2: **Done**. SHOW-3: **Done**. SHOW-4: **Done**. SHOW-5: **Done**. SHOW-6: **Done**. SHOW-7: **Done**. SHOW-8: **Done**. SHOW-9: **Done**. SHOW-10: **Done**. SHOW-11: **Done**. SHOW-12: **Todo**. SHOW-13: **Done**. SHOW-14: **Todo**.

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
- `convex/lib/tvmaze.ts`: `fetchJson` with the User-Agent and 429 retry, and the copy helpers (strip HTML, header picture, drop specials, `order`, `airsAt`, `airTimeKnown`, `seasons`, `yearSeasons`).
- `search.searchShows` action and `shows.add` action, plus the internal mutations that save in batches of 500.
- `convex/lib/progress.ts` with `recomputeProgress`. On add, it sets `airedCount` and the next episode.
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

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-10`
**Screens:** `screens.md` section 5

**How it is built**

- Table `suggestedShows` and the weekly `discover.refreshPool` cron from `system-design.md` section 8.
- Run the pool once by hand on the dev deployment so Discover is not empty: `npx convex run discover:refreshPool`.
- `discover.rows` query. The phone picks 20 from each row's 100 once a day and keeps that row until tomorrow.
- Add from the card uses `shows.add`. Tapping the poster opens the show.

**Acceptance (yes or no)**

- With no shows on my list, the rows are Popular anime, Popular right now, and Top rated.
- With shows on my list, the rows are Because you watch anime (only with anime on my list), More of my two most common genres, and Top rated. Shows on my list are left out.
- Add on a card saves the show and the card reads "Added".
- The same shows stay in each row until the next day. Opening the tab, scrolling, and pulling down do not change them.
- The pool has only shows with a popularity of 85 or more and a poster.
- A Convex test for the row rules and for the anime check (Anime genre, or Japanese animation).

**Tested on:** simulator.

---

## SHOW-11. Profile shows my stats and I can export my history

**Status:** Done
**Apps:** phone, Convex, shared
**Branch:** `feature/SHOW-11`
**Screens:** `screens.md` section 11

**How it is built**

- `profile.stats` query from `userStats`. Watch time as months, days, and hours in `packages/shared` (a month is 30 days).
- `profile.exportHistory` action. The phone writes `showlog-history-YYYY-MM-DD.json` with `expo-file-system` and opens the share sheet with `expo-sharing`.
- "Show data from TVmaze" with a link and the app version on Profile.

**Acceptance (yes or no)**

- Profile shows episodes watched and Watch time, matching my ticks. A missing runtime uses the show's average, or zero.
- Export opens the share sheet and Save to Files writes one JSON file with every show (added time, status) and every watched episode (show, season, number, title, watched time).
- Shared tests for the Watch time format.

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

## SHOW-13. Ticking and adding shows stay inside the Convex Free database limit

**Status:** Done
**Apps:** phone, Convex
**Branch:** `feature/SHOW-13`
**Screens:** none. Nothing on screen changes.

My Convex Free database reads and writes passed the 1 GB monthly cap after I added many shows and ticked many episodes. Ticking and adding must read a few rows, not the whole show.

**How it is built**

- `tickProgress` and `untickProgress` in `convex/lib/progress.ts` update `watchedCount`, `waitingAfterNext`, the next episode, and last watched for one tick without reading the whole show. `tick` and `untick` use them. They fall back to `recomputeProgress` when the row is out of step with the ticks.
- Watch season, watched up to here, adding a show, the hourly clock, and the daily refresh keep `recomputeProgress`.
- `insertShow` reports whether it created the show. `insertEpisodeBatch` skips the per-episode duplicate lookup for a show that was just created.
- New index `by_show_airsAt` on `episodes`. `lists.upcoming` reads each show's episodes from today onward through it, not the whole show.
- `discover.taste` returns my list ids, two genres, and whether I watch anime. `discover.rows` takes them as arguments and reads only the pool, so ticking does not run it again. `useDiscoverRows` loads `taste`, then `rows`, and keeps the old rows on screen while new ones load.
- `system-design.md` and `convex-usage.md` describe the new helpers and the I/O meter.

**Acceptance (yes or no)**

- A test ticks and un-ticks episodes in many orders and checks every progress field against `recomputeProgress` after each step.
- A test ticks the first episode of a show with 1,200 episodes and checks the next episode and the waiting count.
- A tick on a row that was never computed gives the same fields as a full recompute.
- The Discover tab shows the same rows as before, and adding a show from Discover does not flash the loading skeleton.
- Upcoming shows the same episodes and the same shows with no date as before.
- Ticking ten episodes of a long show in a row adds a few hundredths of a gigabyte or less to Database I/O in `npx convex deployment usage`.

**Out of scope:** Watch season and watched up to here on a long show still read the whole show once each. The weekly Discover refresh still rewrites the pool.

**Tested on:** simulator.

---

## SHOW-14. Pick for me finds shows that match my mood

**Status:** Todo
**Apps:** phone, Convex
**Branch:** `feature/SHOW-14`
**Screens:** `screens.md` section 13, the Discover header in section 5, and the `ChoiceChip` and large `Poster` in Shared parts

I open Pick for me from Discover, choose a mood, an episode length, and anime or not, and can add a few words of my own. Showlog shows up to five shows that are not on my list, one at a time, each with one sentence on why it fits. This is RAG (retrieval-augmented generation): Convex vector search finds the shows whose descriptions are closest in meaning to my answers, then OpenAI writes the reasons from those descriptions only. It does not depend on SHOW-12, so it can be built first.

**Where things stand:** every decision for this ticket is written down, and nothing is built. The OpenAI project and key do not exist yet. The ticket starts only when Delasi says so.

**Start here, in this order**

1. Do "Before you start" below. Without the key on dev, nothing in this ticket can be tested.
2. Branch `feature/SHOW-14` from `main` and move this ticket and `STATUS.md` to In Progress.
3. Read these, in this order. Each one holds part of the decisions:
   - `docs/product/locked-decisions.md` section 4, "Pick for me (AI picks)": what is sent to OpenAI, the models, the caps, and what is out.
   - `docs/product/product-requirements.md` flow 14: every question, choice, default, and message on the screen.
   - `docs/product/system-design.md` sections 5 (`suggestedShows`, `showEmbeddings`, `pickCounts`), 7 (`lib/openai.ts`, `lib/pickText.ts`, and the `picks` folder), 8 (the weekly job steps), and 12 (the Convex and OpenAI numbers).
   - `docs/convex-usage.md`, the Pick for me part: which Convex meters move and why embeddings never go on `suggestedShows`.
   - `docs/design/screens.md` section 13, its Mobbin references, and the `ChoiceChip` and large `Poster` in Shared parts.
   - `convex/_generated/ai/guidelines.md`, the vector search and environment variable parts.
4. Build the Convex side first (schema, `lib`, the pool refresh change, then `picks`), with its tests. Run `npx convex run discover:refreshPool` on dev and check that `showEmbeddings` fills.
5. Build the phone side: the Discover bar button, then the Pick for me screen and its skeleton.
6. Check every acceptance line below, then run `yarn lint`, `yarn format:check`, `yarn type-check`, and `yarn test:ci`.
7. After the pull request merges, run `npx convex run --prod discover:refreshPool` once so production gets its embeddings.

**From the product requirements (flow 14)**

- "Find shows returns up to five shows from the Discover pool whose descriptions best match my answers. Shows already on my list are left out."
- "The picks show one at a time: the poster, the name, a meta line with genres, year, and network, and one sentence on why the show fits my answers."
- "I can ask 10 times a day. The eleventh shows "That's today's 10 picks. Try again tomorrow." A day starts at midnight UTC."
- Every question, choice, default, and message on the screen is listed in flow 14. Build those and nothing else.

**Before you start (Delasi, about 10 minutes, once)**

1. Open https://platform.openai.com and sign in. Create a new project named **Showlog**. A project is OpenAI's box for one app's keys and spending.
2. In Billing, add **$5** of prepaid credit and turn **Auto recharge** off. With it off, OpenAI can never charge your card again on its own.
3. In the Showlog project's settings, open **Limits**. Under **Spend**, choose **Edit spend limit**, set the monthly limit to **$5**, turn on **Enforce a hard limit**, and save. This path is from OpenAI's spend-limits guide on 17 Nov 2026. I have not seen the live page.
4. In the Showlog project, create a secret API key. Save it in `ACCESS-LIST.md`, never in `STATUS.md` or the repo.
5. Put the key on both Convex deployments, from the repo root:
   - `npx convex env set OPENAI_API_KEY <the key>` for dev.
   - `npx convex env set --prod OPENAI_API_KEY <the key>` for production.
6. Do not turn on the Convex AI gateway. Showlog calls OpenAI with its own capped key.

**How it is built** (full detail in `system-design.md` sections 3, 5, 7, 8, and 12)

- Install the `openai` package for Convex. The default Convex runtime is enough, because the SDK uses `fetch`.
- Schema: add `averageRuntime`, `tvmazeUpdatedAt`, and `embeddedUpdatedAt` to `suggestedShows`. Add table `showEmbeddings` with index `by_tvmazeId` and the vector index `by_embedding` (512 dimensions, filter field `isAnime`). Add table `pickCounts` with index `by_user_day`.
- `convex/lib/openai.ts` with `embedTexts` and `writeReasons`. `convex/lib/pickText.ts` with `showText`, `answersText`, and `fitsLength`.
- `toPoolShows` keeps `averageRuntime`, `updated`, and the HTML-stripped summary. `upsertSuggestions` returns the shows whose embedding is missing or out of date. `refreshPool` embeds those from the page it already downloaded, saves them with `saveEmbeddings`, and carries on when OpenAI fails. `dropStale` also deletes the stale shows' `showEmbeddings` rows.
- `picks.actions.pick`, `picks.queries.hydrate`, `picks.mutations.recordPick`, and `picks.mutations.saveEmbeddings`, with the steps in `system-design.md` section 7.
- Phone: the Pick for me bar button on Discover, the `(main-app)/pick.tsx` route, `usePickForMe` in `hooks/`, `ChoiceChip` and the large `Poster` in the shared parts, and a `PickForMeScreenSkeleton`. The screen passes `listed` from `discover.taste`. Add to my list uses `shows.add`.
- Run `npx convex run discover:refreshPool` once on dev while building, and `npx convex run --prod discover:refreshPool` once after merge, so every pool show gets its first embedding. The run schedules itself page by page, paced for TVmaze, so it finishes on its own after a while. Watch it in the Convex dashboard logs.

**Acceptance (yes or no)**

- The OpenAI Showlog project shows a $5 hard monthly limit, and auto recharge is off.
- `OPENAI_API_KEY` exists on the dev and the production Convex deployments, and no key is in the repo.
- After the first `refreshPool` run, `showEmbeddings` has one row for every `suggestedShows` row.
- A second `refreshPool` run with no TVmaze changes embeds no shows. A Convex test proves the upsert returns no shows the second time.
- Find shows stays disabled until a mood is chosen. Any length and Either are chosen at first.
- Picks never include a show on my list. Under 30 minutes and About an hour leave out shows of other lengths and shows with no runtime. A Convex test with a mocked OpenAI proves both.
- Each pick shows the poster, the name, the meta line, a one-sentence reason, and "Pick n of 5". Next pick moves through all five without a new server call. On the last pick, Next pick reads Change answers.
- Change answers returns to the questions with my answers kept.
- Add to my list adds the show, and the button reads "On your list". Tapping the poster opens the show.
- The eleventh pick on one day shows "That's today's 10 picks. Try again tomorrow." A Convex test proves it.
- With a wrong `OPENAI_API_KEY` on dev, Pick for me shows "Pick for me isn't available right now.", and the rest of the app works. When only the reason call fails, the picks show without a reason. A Convex test covers the second case.
- A word of my own longer than 200 characters cannot be typed, and the server refuses it too.
- `npx convex deployment usage` after ten picks shows Database I/O up by about 1 MB, and search queries up by under 1 query-GB.
- The screen matches `screens.md` section 13 at 375 and 430 wide, including loading, no matches, the daily limit, and the failure state.

**Out of scope:** chat with the model, picks for several people at once, movies, picks from shows outside the Discover pool, saving past picks, and personal picks from my watch history. That last one would average the embeddings of shows I finished. It is a possible later ticket, not part of this version.

**Tested on:** simulator.

---

## Related docs

- `docs/product/locked-decisions.md`
- `docs/product/product-requirements.md`
- `docs/product/system-design.md`
- `docs/design/screens.md`
- `docs/design/design-system.md`
