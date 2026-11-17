# Project requirements — Showlog

**Status:** Approved on 8 Oct 2026. Discover added the same day. Pick for me added on 17 Nov 2026. Decisions come from `locked-decisions.md`.
**Date:** 8 Oct 2026
**Owner:** Delasi Mensah

---

## 1. Goal

An iPhone app where I find the TV shows I watch, add them to my list, tick off the episodes I have seen, see where I left off, and get told when a new episode is out.

---

## 2. Users and platforms

- **Users:** one person, me. One account.
- **Platforms:** iPhone only, built with Expo. No website, no Android.
- **Builds:** development app on the iOS simulator (`com.dmstudios.showlog.dev`), preview app on my iPhone (`com.dmstudios.showlog.staging`). Both use the Convex dev deployment.

---

## 3. Core flows

Each flow lists what must be true for it to count as done.

**1. Sign in**

- I can create an account with email and password the first time.
- A second sign-up is refused by the server with the message "This app already has an account."
- I stay signed in after closing the app.

**2. Search and add a show**

- Search opens from Discover.
- Typing a name shows TVmaze matches with poster, type (for example Animation), language, first-air year, and network or streaming service. A typo still finds the show. Searching "one piece" lets me tell the 1999 Japanese anime on Fuji TV from the 2023 Netflix live-action series at a glance.
- A show already on my list shows "On your list" instead of Add.
- Adding a show saves the show and all its numbered episodes, and the show appears in My shows as Not started.

**3. Discover**

- Shows rows of suggested shows from the suggestion pool (popular TVmaze shows with a popularity score of 85 or more, refreshed weekly). Shows already on my list are left out.
- Before I add any shows, the rows are Popular anime, Popular right now (running shows), and Top rated (rating 8 or more).
- After I add shows, the rows are Because you watch anime (only if anime is on my list), More of my two most common genres (for example "More Drama"), and Top rated.
- A show counts as anime if TVmaze gives it the Anime genre, or if it is Japanese animation.
- Each row shows 20 shows picked from the 100 best-rated matches. That pick lasts until the next day.
- Each card shows the poster, name, and year, with an Add button. Adding works from the card, and the card shows "Added".
- Tapping a card opens the show with its genres, rating, status, network, number of seasons, summary, and an Add button.
- The suggestion pool is filled once during setup, so Discover is never empty on the first open.
- A **Pick for me** button sits in the Discover header, left of Search. It opens Pick for me (flow 14).

**4. Tick episodes**

- On a season, I can tick and untick any aired episode.
- An episode that has not aired shows a countdown ("in 5 days") instead of a tick.
- **Watched up to here** ticks that episode and every earlier aired episode in the show.
- **Watch season** ticks every aired episode in that season. The season row shows "10/24" and a progress bar.
- Episode rows read "S4 | E11" on normal shows.
- On shows whose seasons are years on TVmaze (season number 1900 or higher, such as One Piece), rows read "Episode 1180" with "2026 · E25" under it. The overall number counts the show's numbered episodes in airing order. Seasons are listed by year.
- Ticking feels instant: the tick shows before the server replies, and a short haptic tap plays.

**5. Up next**

- One card per show on my list (not Watch later, not Stopped) that has an aired episode I have not ticked.
- Each card shows the episode picture, show name, next episode number and title, and "+3" when more aired episodes wait after it.
- A tick button on the card marks that episode watched, and the card moves to the following episode. When nothing is left, the card leaves the list.
- Shows with a watch in the last 30 days come first, newest first. Shows with no watch in 30 days or more sit under **Paused for a while**. Shows I added but never ticked sit under **Not started**.
- Tapping a card opens the show.

**6. Where you left off**

- On a show I have watched before, a card shows the last episode I ticked, the date I ticked it, and TVmaze's summary of that episode.
- Under it, the next episode to watch with its title and summary.
- A show with nothing ticked shows "Start with S1 | E1" instead.

**7. Upcoming**

- Lists episodes of my shows (not Stopped) that have not aired yet, grouped Today, Tomorrow, the rest of this week by day name, then one heading per later day with that date ("19 Oct").
- Each row shows the episode and the air time in my phone's time. An episode with a date and no time shows "Time TBA". The network is on the show screen.
- Episode 1 of a season is labelled Premiere.
- Shows with nothing scheduled are listed at the bottom as "No date yet". Ended shows are left out.

**8. My shows**

- A three-column poster grid with a progress bar under each poster (episodes ticked out of episodes aired).
- A sort and filter sheet: sort by Last watched, Last added, or A to Z. Filter by All, Watching, Up to date, Not started, Watch later, Finished, or Stopped. The choice is remembered on the phone.
- Sort and filter only narrow the shows already on the list. A new show is found on Discover.

**9. Watch later and Stop watching**

- From the show menu, **Watch later** keeps the show out of Up next and out of new-episode alerts. It stays in Upcoming. Ticking any of its episodes clears Watch later.
- **Stop watching** takes the show out of Up next, Upcoming, and all alerts, and keeps its ticks. **Resume** undoes it.
- **Remove from my list** asks me to confirm, then deletes the show from my list along with my ticks. The button is red text.

**10. Profile and stats**

- Stats at the top: episodes watched, and Watch time as months, days, and hours (a month is 30 days).
- Watch time adds up the runtime of every ticked episode. A missing runtime uses the show's average runtime, or zero if TVmaze has neither.
- Below: account email, an alerts on or off switch, Export my history, "Show data from TVmaze" with a link, and the app version.
- Sign out is red text and asks me to confirm.
- Profile opens from an icon in the My shows header.

**11. New episode alert**

- When an episode of a show I am watching airs, an alert arrives within an hour: "New episode of The Bear: S4 | E1."
- A season dropped all at once sends one alert for the show: "Season 3 of Slow Horses is out, 6 episodes."
- No alerts between 22:00 and 08:00 phone time. Held alerts send at 08:00.
- Tapping the alert opens that show, including when the app was fully closed.

**12. Premiere date alert**

- When a show on my list (not Stopped) had no upcoming episode and TVmaze adds one, an alert arrives: "Severance season 3 premieres 12 January."
- Same quiet hours and tap behaviour as the new-episode alert.

**13. Export**

- Export makes one JSON file (a plain text data file) with my shows, the time I added each, each show's status, and every watched episode with show name, season, number, title, and watched time.
- It opens the iPhone share sheet so I can save it to Files.

**14. Pick for me**

- Pick for me opens from the Discover header and asks three questions on one screen.
- **Mood**, pick one: Light and funny, Gripping and tense, Feel-good, Emotional, Dark and gritty, Mind-bending, Action and adventure, or Romantic.
- **Episode length**, pick one: Under 30 minutes, About an hour, or Any length. Under 30 minutes keeps shows whose average runtime is 30 minutes or less. About an hour keeps 31 to 70 minutes. A show with no runtime on TVmaze is kept only under Any length.
- **Anime**, pick one: Anime, Not anime, or Either.
- **Anything else?** is an optional line of my own words, up to 200 characters, for example "set in space" or "like Severance".
- Find shows stays disabled until a mood is picked. Episode length starts on Any length and Anime starts on Either.
- Find shows returns up to five shows from the Discover pool whose descriptions best match my answers. Shows already on my list are left out.
- The picks show one at a time: the poster, the name, a meta line with genres, year, and network, and one sentence on why the show fits my answers. The sentence uses only the show's TVmaze summary and my answers, and gives no spoilers.
- Under the pick: **Add to my list** (reads "On your list" after adding) and **Next pick**. Tapping the poster opens the show. A line reads "Pick 2 of 5". After the last pick, Next pick becomes **Change answers**.
- **Change answers** at the top returns to the questions with my answers kept.
- I can ask 10 times a day. The eleventh shows "That's today's 10 picks. Try again tomorrow." A day starts at midnight UTC.
- When nothing matches, it shows "No shows match those answers. Try another mood or length."
- When OpenAI is unavailable, it shows "Pick for me isn't available right now." If only the reasons fail, the picks show without a reason.

**Out of scope:** movies, specials, Android, a website, iPad layouts, widgets, App Store or TestFlight, import from TV Time or Trakt, ratings, reviews, social features, favourites, custom lists, sharing, "where to watch" links, rewatch tracking, offline use, more than one account, password reset by email, a mute button for each show.

---

## 4. Screens

References for each screen are in `docs/design/references/tvtime/`. Mobbin references are added in the design step.

1. **Sign in** — email, password, Sign in button, Create account link.
2. **Watching** (tab) — sections Up next, Paused for a while, Not started. Empty state: "Add the shows you watch" with a Discover button. Reference: `01-watch-list.jpg`.
3. **Upcoming** (tab) — date-grouped list. Empty state: "Nothing scheduled for your shows yet." References: `03`, `04`.
4. **My shows** (tab) — poster grid, sort and filter sheet. Profile icon in the header. Empty state sends you to Discover. References: `06`, `07`.
5. **Discover** (tab) — rows of suggested shows, each card with poster, name, year, and Add. Pick for me and Search buttons in the header. The same 20 stay until the next day.
6. **Search** — search field, results with Add.
7. **Show** — header picture, name, seasons and network, progress bar, Where you left off card, seasons, menu (Watch later, Stop watching, Remove from my list), TVmaze credit. A show not on my list yet shows genres, rating, status, network, number of seasons, summary, and Add instead of episodes. References: `10`, `11`, `14`, `16`.
8. **Season** (opens inside the show) — episode rows with picture, number, title, tick or countdown. Watch season. References: `12`, `13`.
9. **Episode sheet** — picture, title, number, air date, runtime, summary, watched toggle, Watched up to here.
10. **Profile** — stats, settings, export, sign out. Reference: `08`.
11. **Before alerts** — one screen before the iPhone permission prompt: "Showlog tells you when a new episode of your shows is out, and when a new season gets a date." Allow and Not now.
12. **Pick for me** — the three questions and Anything else, then one pick at a time with poster, name, reason, Add to my list, and Next pick.

Tabs, in order: Watching, Upcoming, Discover, My shows.

---

## 5. Core entities

- **Show** — a copy of a TVmaze show: TVmaze id, name, poster address, header picture address, status, network or streaming service, premiere date, average runtime, summary, last TVmaze update time. Has many episodes.
- **Episode** — a copy of a TVmaze episode: TVmaze id, show, season number, episode number, overall number (used for year-numbered shows), title, air time (UTC), air date, runtime, summary, picture address. Belongs to a show.
- **My show** — a show on my list: user, show, added time, last watched time, watch-later flag, stopped time (empty unless stopped). One per user and show.
- **Watched episode** — user, episode, show, watched time. One per user and episode.
- **Push token** — user, Expo push token, alerts on or off, time zone (for quiet hours).
- **Pending alert** — an alert waiting for quiet hours to end: user, show, message, send-after time.
- **Suggested show** — a show in the Discover pool: TVmaze id, name, poster address, genres, type, language, premiere year, status, rating, network, popularity score, average runtime, TVmaze update time, and the TVmaze update time its embedding was made from. Replaced by the weekly refresh. Separate from Show, which holds only shows on my list.
- **Show embedding** — one per pool show: TVmaze id, anime flag, the plain-text summary, and the embedding (512 numbers). Used only by Pick for me. Deleted when its show leaves the pool.
- **Pick count** — user, day (UTC), and how many picks I asked for that day. Enforces the 10-a-day limit.
- **User** — from Convex Auth. Email only.

Seasons are not stored as their own records. They come from the episode season numbers.

---

## 6. Integrations

- **TVmaze public API** — show search, show details, episode lists, daily update list, and the show index for the Discover pool (weekly). Free, no key, CC BY-SA (credit TVmaze with a link). Called only from Convex actions, never from the phone, so retries and the User-Agent header live in one place.
- **TVmaze image servers** — posters, header pictures, and episode pictures, linked directly and kept on the phone by `expo-image`. Not stored in Convex.
- **Expo push** — alerts from Convex to my iPhone, through the Apple push key on the Expo project.
- **Convex Auth** — email and password, one account.
- **OpenAI API** — embeddings (`text-embedding-3-small`, 512 numbers) for pool shows and for my answers, and one-sentence reasons (`gpt-6-luna`, reasoning off). Paid, from prepaid credit with auto recharge off and a hard $5 monthly limit on the Showlog project. Called only from Convex actions with `OPENAI_API_KEY`, never from the phone.

---

## 7. Rules and compliance

- **Permissions:** every query and mutation checks the signed-in user and reads or writes only that user's records. Show and episode copies are shared reference data, but only signed-in calls can read them.
- **One account:** the sign-up path refuses when a user already exists.
- **Credit:** "Show data from TVmaze" with a link on the show screen and on Profile.
- **Personal data:** my email only. Removing a show deletes my ticks for it.

---

## 8. Non-functional

- **Scale:** one user, 30 to 100 shows, a few thousand episodes. Long anime runs (One Piece has over 1,100 episodes) must open a season without loading every episode at once.
- **Speed:** ticks show instantly. Search answers within about a second on normal internet. Pick for me answers within about five seconds.
- **Freshness:** TVmaze changes reach the app within a day (daily refresh). The Discover pool refreshes weekly. New-episode alerts within an hour of air time.
- **Offline:** not supported. The app needs a connection.
- **Cost:** Convex, Expo, and TVmaze stay on free plans. No Convex file storage. OpenAI is the one paid service, capped at $5 a month by OpenAI and at 10 picks a day by Showlog. Expected spend is a few cents a month.

---

## 9. Success and priorities

- **Success:** I use Showlog for every show I watch for a month, and I no longer open Trakt.
- **Priority if time runs short:** search and add, ticking, Up next, and Where you left off first. Then My shows, Upcoming, and Discover. Then stats and export. Then alerts. Pick for me does not depend on alerts, so it can be built before or after them.
