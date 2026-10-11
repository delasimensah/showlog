# System design — Showlog

**Status:** written 8 Oct 2026, from `locked-decisions.md` and `product-requirements.md`.
**Owner:** Delasi Mensah

The product requirements say **what** Showlog does. This file says **how**: what is stored, which server functions exist, which jobs run on a clock, and the order to build it in. Screen layouts live in `docs/design/screens.md`. Tickets live in `docs/product/linear-tickets.md`.

---

## 1. What has to be true, in priority order

1. **Ticks are never lost and always correct.** My watch history is the one thing that cannot be rebuilt. Every tick is saved on the server, and every count on screen comes from those saved ticks.
2. **Up next is right.** The next episode, the "+N", and the sections must match my ticks and what has aired. This is the screen I open every day.
3. **Ticking feels instant.** The tick shows before the server replies, with a small haptic tap.
4. **TVmaze changes reach the app within a day**, and a new episode reaches Up next within an hour of airing.
5. **Everything stays on free plans.** No Convex file storage. TVmaze calls stay under its limit.

---

## 2. The shape of the system

Three parts:

- **The iPhone app** (`apps/mobile-app`). Expo Router screens, NativeWind styling, Convex React hooks for data. It never calls TVmaze for data. It only loads pictures from TVmaze's image servers with `expo-image`.
- **Convex** (`convex/`). The database, the server functions the app calls, and the jobs that run on a clock. It is the only part that talks to TVmaze and to Expo push.
- **The shared package** (`packages/shared`). Pure functions both sides use and that need no network: the episode label ("S4 | E11" or "Episode 1180"), show status, "+N", Watch time as months, days, and hours, quiet hours. Unit tested.

Outside services:

- **TVmaze API** (`https://api.tvmaze.com`) for show and episode data. Free, no key.
- **TVmaze image servers** (`https://static.tvmaze.com`) for posters and pictures. The phone links to them directly.
- **Expo push** (`https://exp.host/--/api/v2/push/send`) to send phone alerts. Expo passes them to Apple.

---

## 3. How a request flows

**Reading** (Up next, My shows, a season): the app calls a Convex **query**. A query is a read-only server function. Convex keeps it live: when the data it read changes, the app gets the new answer by itself. No refresh button, no cache to clear.

**Ticking** (tick, untick, watch season, watched up to here): the app calls a Convex **mutation**, a server function that writes. The app shows the tick first with an **optimistic update** (Convex's way of drawing the expected result before the server confirms), and plays the haptic. If the server refuses (for example the episode has not aired), the tick goes back and a toast says why.

**Anything that needs TVmaze** (search, adding a show, opening a show that is not on my list): the app calls a Convex **action**, a server function that may call outside services. The action calls TVmaze, then hands the result to an internal mutation to save it.

**Clock jobs**: Convex **crons** (functions Convex runs on a schedule) do the hourly, daily, and weekly work in section 8.

---

## 4. Who can read and write

- One account. The first sign-up creates it. After that, `convex/auth.ts` refuses any new sign-up with "This app already has an account." This lives in the Convex Auth `createOrUpdateUser` callback, so it holds even if someone calls the sign-up endpoint directly.
- Every public query and mutation is built with `authedQuery` or `authedMutation` from `convex/lib/functions.ts`. They refuse a caller who is not signed in.
- Every row a user owns (`myShows`, `watchedEpisodes`, `userStats`, `pushTokens`, `pendingAlerts`) carries `userId`. Functions read and write only rows where `userId` is the caller.
- `shows`, `episodes`, and `suggestedShows` are copies of TVmaze data. Any signed-in caller may read them. Only internal functions write them.
- Public actions (search, add, preview) check the caller with `getAuthUserId` first.

---

## 5. What is stored

Field names are what the schema in `convex/schema.ts` uses. Times are milliseconds since 1970 in UTC (world time).

### shows

A copy of a TVmaze show that is on my list.

- `tvmazeId`, `name`, `type` (for example Animation), `language`, `genres` (array), `status` (Running, Ended, To Be Determined, In Development)
- `network` (network or streaming service name), `networkTimeZone`
- `premiered` (date text), `averageRuntime` (minutes, may be missing), `rating` (may be missing)
- `summary` (plain text: TVmaze sends HTML, so tags are stripped when saving)
- `posterUrl`, `headerUrl` (see below)
- `seasons`: array of `{ number, episodeCount, firstOrder }`, worked out from the episodes when the show is saved. The show screen lists seasons from this array, so it never loads every episode of One Piece.
- `yearSeasons`: true when the seasons are years (season number 1900 or higher)
- `tvmazeUpdatedAt`: TVmaze's `updated` time, so the daily refresh can skip shows that did not change
- Index: `by_tvmazeId`

**Header picture:** from the show's TVmaze images. The main `background` picture first, then any `background` picture, then the poster. TVmaze does not always mark a main background (One Piece has none marked), so the fallback matters.

### episodes

A copy of every numbered TVmaze episode of a show on my list. Specials (episodes with no number, or a type other than `regular`) are left out.

- `showId`, `tvmazeId`, `season`, `number`, `order` (position among the show's numbered episodes in airing order, starting at 1)
- `name`, `summary` (plain text), `runtime` (may be missing), `imageUrl` (may be missing)
- `airsAt`: when it airs. TVmaze's `airstamp` when there is one. If TVmaze has only a date, midnight UTC on that date, with `airTimeKnown: false` so the app shows the date only. If TVmaze has neither, `airsAt` is missing and the episode counts as "No date yet".
- Indexes: `by_show_order` (`showId`, `order`), `by_show_season` (`showId`, `season`, `number`), `by_show_airsAt` (`showId`, `airsAt`), `by_tvmazeId`, `by_airsAt` (`airsAt`)

**Overall number** for year-season shows ("Episode 1180") is `order`. TVmaze already returns episodes in airing order, so `order` is their position in that list.

### myShows

A show on my list. One per user and show.

- `userId`, `showId`, `addedAt`
- `watchLater` (true or false), `stoppedAt` (missing unless stopped)
- **Progress, kept up to date by the server** (see section 6): `airedCount`, `watchedCount`, `nextEpisodeId` (missing when nothing aired is waiting), `waitingAfterNext` (the "+N"), `lastWatchedAt`, `lastWatchedEpisodeId`
- Indexes: `by_user_show`, `by_user_lastWatchedAt`, `by_user_addedAt`, `by_show`

### watchedEpisodes

One row per ticked episode.

- `userId`, `showId`, `episodeId`, `season`, `watchedAt`, `minutes` (the runtime counted for stats, worked out when ticked)
- Indexes: `by_user_episode`, `by_user_show`, `by_user_show_season`

`season` is copied onto the row so the season list can show "10/24" by counting ticks for one season through an index, without loading the episodes.

### userStats

One row per user, so Profile does not add up thousands of ticks each time it opens.

- `userId`, `episodesWatched`, `minutesWatched`
- Every tick adds to it. Every untick and every removed show takes away from it.

### pushTokens

- `userId`, `token` (Expo push token), `alertsOn`, `timeZone` (for example `Africa/Accra`, from the phone), `updatedAt`
- Index: `by_user`, `by_token`

### pendingAlerts

An alert waiting for quiet hours to end, or waiting to be sent.

- `userId`, `showId`, `title`, `body`, `sendAfter`
- Index: `by_sendAfter`

### suggestedShows

The Discover pool. Separate from `shows`, because it holds shows that are not on my list.

- `tvmazeId`, `name`, `posterUrl`, `genres`, `type`, `language`, `premieredYear`, `status`, `rating`, `network`, `weight` (TVmaze popularity, 0 to 100), `isAnime`, `refreshId`
- Indexes: `by_tvmazeId`, `by_rating`, `by_anime_rating` (`isAnime`, `rating`), `by_status_rating` (`status`, `rating`)

`isAnime` is true when the genres include Anime, or when the type is Animation and the language is Japanese.

Seasons are not their own table. They come from `shows.seasons`.

---

## 6. Progress, the heart of the product

Up next, My shows progress bars, and status filters all read the progress fields on `myShows`. They are never worked out on the phone.

Two kinds of helper in `convex/lib/progress.ts` keep these fields right.

`recomputeProgress(ctx, myShowId, now)` sets every progress field from the episodes and ticks. It reads the whole show, so it runs only when the aired episodes can have changed or many ticks changed at once:

- after watch season and watched up to here (in the same mutation)
- after a show is added or refreshed
- in the hourly job, for every show that has an episode that aired in the last hour

`tickProgress` and `untickProgress` update the fields for one tick or untick without reading the whole show:

- Every tick is for an aired episode, and an episode that has aired stays aired. So the episodes still waiting are the aired ones minus the ticked ones, and `waitingAfterNext` is `airedCount - watchedCount - 1` while a next episode exists.
- Ticking the next episode moves "next" forward to the first aired, un-ticked episode after it. The search reads episodes in order and stops at the first match, so watching in order reads one episode.
- Un-ticking an episode before the next one makes it the next one. Un-ticking the last watched episode walks back to the nearest ticked episode.
- When the row is out of step with the ticks (for example it was never computed), they fall back to `recomputeProgress`.

**Why the hourly job matters:** "aired" depends on the clock, not on a write. Without the hourly pass, an episode that aired at 3 am would not appear in Up next until I ticked something. The hourly job is the app's clock.

**Rules the helper follows** (from the locked decisions):

- Aired = `airsAt` is at or before now. When the time is unknown, aired = the date is before today in UTC.
- Next episode = the lowest `order` that has aired and is not ticked.
- `waitingAfterNext` = aired, not ticked, after the next episode. Shown as "+N" only when it is above zero.
- Last watched = the ticked episode furthest along in airing order. Watch season and watched up to here move it to the end of what they just marked, so a show that is caught up does not stay on an earlier single tick. The date is when that episode was ticked.
- Show status (for filters and labels), worked out in `packages/shared` from the progress fields, the TVmaze status, `watchLater`, and `stoppedAt`: Stopped, Watch later, Not started, Finished, Up to date, Watching. Stopped and Watch later win when set.

**Size check:** One Piece has 1,181 episodes. A full recompute reads that many rows once, which is far below Convex's per-function read limit. It is not run on every tick, because Convex Free allows 1 GB of database reads and writes a month and a long show ticked one episode at a time would use it up. A single tick reads a few rows. Up next itself reads only `myShows` rows and the next episode for each, so it stays small no matter how long a show is.

---

## 7. The functions

Files under `convex/`, one folder per area. Queries, mutations, and actions are separate files, so the path says which kind you are opening. Public functions are signed-in only.

**`auth.ts`**

- Password provider. `createOrUpdateUser` refuses a second account.

**`lib/tvmaze.ts`** (internal helpers, used only by actions)

- `fetchJson(path)`: sends the `User-Agent: Showlog/1.0 (personal app; github.com/delasimensah/showlog)` header. On a 429 reply it waits the seconds in `Retry-After` (or 5), up to three tries.
- `toShowCopy`, `toEpisodeCopies`: turn TVmaze replies into rows, strip HTML from summaries, pick the header picture, drop specials.

**`search/actions.ts`** and **`search/queries.ts`**

- `searchShows({ query })` action: calls `/search/shows?q=`, returns up to 10 results with poster, name, type, language, premiered year, network, and `onList`.

**`shows/actions.ts`**, **`shows/queries.ts`**, and **`shows/mutations.ts`**

- `add({ tvmazeId })` action: fetches `/shows/{id}?embed[]=episodes&embed[]=images`, then saves the show and its episodes in batches of 500, creates the `myShows` row, and runs `recomputeProgress`. If the show is already on my list, it returns that row.
- `preview({ tvmazeId })` action: for a show not on my list. Returns genres, rating, status, network, season count, summary, header and poster. Saves nothing.
- `get({ tvmazeId })` query: the show, its `myShows` row, the Where you left off episode and the next episode, or null when not on my list.
- `season({ showId, season })` query: that season's episodes in order, with a watched flag on each.
- `remove({ myShowId })` mutation: deletes my ticks for the show, takes them off `userStats`, deletes the `myShows` row, then schedules deletion of the show copy and its episodes.
- `setWatchLater({ myShowId, on })`, `stop({ myShowId })`, `resume({ myShowId })` mutations.

**`watching/mutations.ts`**

- `tick({ episodeId })`, `untick({ episodeId })`, `watchSeason({ showId, season })`, `watchUpTo({ episodeId })` mutations. Each refuses an episode that has not aired, saves one shared `watchedAt` for the batch, clears `watchLater` on that show, and updates `userStats`. `tick` and `untick` then run `tickProgress` or `untickProgress`. Watch season and watched up to here run `recomputeProgress`.

**`lists/queries.ts`**

- `upNext()` query: my shows with a next episode and not Watch later or Stopped, split into Up next (watched in the last 30 days), Paused for a while, and Not started.
- `myShows({ sort })` query: every show on my list with poster, progress, and status. The filter runs on the phone because the list is small.
- `upcoming({ now })` query: future episodes of my shows, not Stopped, plus shows with nothing scheduled. It reads each show's episodes from today onward through `by_show_airsAt`, not the whole show. The phone passes the current time rounded down to the hour, so the answer refreshes each hour without the server guessing the time.

**`discover/queries.ts`**

- `taste()` query: the ids of the shows on my list, my two most common genres, and whether I watch anime. It is separate from `rows` so that `rows`, which reads the pool, does not run again every time a tick changes my list.
- `rows({ listed, genres, watchesAnime })` query: the three rows for my state (section 5 of the locked decisions). The phone passes in what `taste` returned. Each row returns the 100 best-rated matches that are not on my list. The phone picks 20 once a day and keeps them until tomorrow. Picking on the phone is required, because Convex queries must give the same answer every time they run.

**`profile/queries.ts`** and **`profile/actions.ts`**

- `account()` query: the signed-in person's name and email.
- `stats()` query: from `userStats`.
- `exportHistory()` action: reads my shows and ticks page by page through internal queries and returns one JSON text. The phone saves it with `expo-file-system` and opens the share sheet with `expo-sharing`.

**`alerts.ts`**

- `saveToken({ token, timeZone })`, `setAlertsOn({ on })` mutations, `settings()` query.
- `sendTest()` internal action: sends "Showlog alerts are working" to my saved token, run from the Convex dashboard or `npx convex run alerts:sendTest` to prove the Apple push key.

---

## 8. Clock jobs (`convex/crons.ts`)

**Hourly, on the hour:** `clock.mutations.hourly`

1. Find episodes with `airsAt` in the last hour (index `by_airsAt`).
2. Run `recomputeProgress` for each of their shows that is on my list.
3. Build new-episode alerts for shows that are not Watch later or Stopped: one alert per show, saying "Season 3 of Slow Horses is out, 6 episodes" when several episodes of one season aired together.
4. Put alerts in `pendingAlerts` with `sendAfter` = now, or 08:00 my time when now is between 22:00 and 08:00 my time.
5. Send every pending alert whose `sendAfter` has passed, when alerts are on, through Expo push. Delete each one once Expo accepts it. A failed send stays for the next hour.

**Daily, 04:00 UTC:** `refresh.actions.daily`

1. Call `/updates/shows?since=day`. Keep only the TVmaze ids that are in `shows`.
2. For each, fetch the show again and update the copy: changed episodes are updated, new ones added, and ones TVmaze removed are deleted along with any ticks on them.
3. Run `recomputeProgress` for the show.
4. If the show had no future episode before and has one now, and the show is not Stopped, queue a premiere-date alert: "Severance season 3 premieres 12 January."

**Weekly, Monday 03:00 UTC:** `discover.actions.refreshPool`

1. Walk TVmaze's show index (`/shows?page=0`, `1`, …) about 15 pages per run, then schedule the next run 10 seconds later. That stays under 20 calls every 10 seconds, and under Convex's 10-minute action limit.
2. Keep shows with `weight` 85 or more and a poster. Upsert into `suggestedShows` with this run's `refreshId`.
3. When TVmaze returns a 404 (past the last page), delete pool rows with an older `refreshId`.
4. The same job is run by hand once during setup so Discover is never empty: `npx convex run discover:refreshPool`.

---

## 9. Phone alerts

- The phone asks for permission only after the Before alerts screen, then gets an Expo push token with `expo-notifications` and the Expo project id, and sends it with `alerts.saveToken`.
- Each alert carries `{ tvmazeId }`. Tapping it opens `/show/{tvmazeId}`, also when the app was fully closed (read with `Notifications.getLastNotificationResponseAsync` at start).
- Needs the Apple push key on the Expo project first. That is the first step of the alerts ticket, done by Delasi with `project-template/docs/client-delivery/push-notifications-setup.md`, the iPhone (Apple) part only.
- Proven on the preview app on the real iPhone. The simulator cannot receive push alerts.

---

## 10. Where code lives in the phone app

- Routes in `apps/mobile-app/app/`:
  - `(auth)/sign-in.tsx`
  - `(main-app)/(tabs)/_layout.tsx` with a stack on each tab: `up-next/`, `upcoming/`, `discover/`, `my-shows/`. Each stack's first screen is `index.tsx`.
  - `(main-app)/search.tsx`
  - `(main-app)/show/[tvmazeId]/index.tsx` and `(main-app)/show/[tvmazeId]/season/[season].tsx`. The show screen is a screen of the main stack, so the system back button returns to the screen that opened it.
  - `(main-app)/profile.tsx`, `(main-app)/alerts-intro.tsx`
- The episode sheet is a bottom sheet in `components/bottom-sheets/`, opened through `BottomSheetsManager`.
- Feature components in `components/[feature]/` (for example `components/shows/`, `components/up-next/`). Screens in `components/screens/`.
- Data hooks in `hooks/` wrap the Convex calls, so screens do not import `api` directly.
- Zustand only for phone-side choices: the My shows sort and filter (saved to the phone with AsyncStorage).
- Native iPhone controls from `@expo/ui` for the show menu, the sort and filter choices, and the alerts switch.

---

## 11. What could go wrong, and what proves it did not

- **A tick counted twice, or progress drifting from ticks.** `tick` refuses a second row for the same episode (index `by_user_episode`). Tests tick, untick, watch season, and watch up to here, then check every progress field and `userStats`.
- **Up next missing a new episode.** Tests run the hourly job with a fake clock and check that an episode that just aired becomes the next episode.
- **One Piece being slow.** The season query reads one season by index. The show screen reads `shows.seasons`. Tests use a show with more than 1,000 episodes.
- **TVmaze 429.** `fetchJson` waits and retries. The pool job paces itself.
- **TVmaze removes or renumbers an episode.** The refresh deletes the episode and its tick and recomputes. My stats drop by that episode, which matches what TVmaze now says.
- **Alerts at 2 am.** Quiet-hours tests in `packages/shared` cover 21:59, 22:00, 07:59, and 08:00 in Accra time.
- **A second account.** A Convex test signs up twice and expects the refusal.

---

## 12. Cost check

- **Convex function calls:** about 720 hourly runs, 30 daily refreshes, and about 100 pool runs a month, plus my taps. Far under 1,000,000 a month.
- **Convex database:** a few thousand episodes, a few thousand pool rows. A few MB.
- **Convex file storage:** none. Pictures stay on TVmaze's servers.
- **TVmaze:** about 350 calls a week for the pool, a handful a day for refreshes and searches.
- **Expo:** alerts are free. Builds: one simulator and one preview to start.

---

## 13. The same design in generic cloud terms

- Identity: Amazon Cognito → Convex Auth with email and password.
- Database: Amazon RDS or DynamoDB → Convex tables with indexes.
- Object storage: Amazon S3 → none. TVmaze's image servers act as the picture host.
- Queue and scheduled work: Amazon SQS and EventBridge → Convex crons and `scheduler.runAfter`.
- Outside API calls: AWS Lambda → Convex actions.
- Push: Amazon SNS → Expo push.
- Secrets: AWS Secrets Manager → Convex environment variables (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`). TVmaze and Expo push need no secret.

---

## 14. What we are not building, and what would change if we did

- **More than one account.** Would need sign-up open, and `shows` and `episodes` stay shared while everything else is already keyed by `userId`.
- **Offline use.** Would need a phone-side store of ticks and a retry queue. Not in this version.
- **Movies and specials.** Would need a second content type and new TVmaze calls.
- **Production Convex.** Would need its own auth keys and an empty database. Not in this version.

---

## 15. The order we build it in

The tickets follow this order (full text in `linear-tickets.md`):

1. Sign in, the four tabs, and Profile with Sign out
2. Search and add a show
3. The show screen, for a show on my list and one that is not
4. A season, ticking, and the episode sheet
5. Up next, Where you left off, and the hourly clock
6. My shows with sort and filter
7. The daily TVmaze refresh
8. Upcoming
9. Watch later, Stop watching, and Remove
10. Discover and the weekly pool
11. Profile stats and export
12. Phone alerts

That is the priority in the product requirements: search, ticking, Up next, and Where you left off first. Then My shows, Upcoming, and Discover. Then stats and export. Then alerts.
