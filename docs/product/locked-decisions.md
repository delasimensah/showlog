# Showlog — locked product decisions

**Status:** Approved by Delasi on 8 Oct 2026. Discover added the same day at his request. Pick for me (AI picks, paid OpenAI with hard caps) added on 17 Nov 2026 at his request.
**Date:** 8 Oct 2026
**Owner:** Delasi Mensah. Personal app. One user.

This file freezes the product calls so the questionnaire, the product requirements, the system design, and the tickets cannot invent gaps. If something is not listed under version one, it is not in version one.

---

## 1. What Showlog is

**One sentence.** Showlog is an iPhone app where I find the TV shows I watch, add them to my list, tick off the episodes I have seen, see where I left off, and get told when a new episode is out.

**Why it exists.** TV Time shut down. Trakt works but its screens are crowded. Showlog does the things TV Time did for me and nothing else.

**Name.** A log of the shows I watch. Short, and says what it is.

**Not published.** No App Store listing. Showlog(Staging) and Showlog are both installed from a link onto my registered iPhone, without the store.

---

## 2. Platform and accounts

- **iPhone only.** Expo and React Native. No Android build, no website.
- **Development app** on the iOS simulator for day-to-day building, using Metro (the local server that sends code changes to the app). App id `com.dmstudios.showlog.dev`.
- **Preview app** on my real iPhone. App id `com.dmstudios.showlog.staging`. Talks to the dev database. This is where phone alerts are proven.
- **Production app** on the same iPhone. App id `com.dmstudios.showlog`, named Showlog. Installed from a link. Talks to the production database. My shows in the preview app stay there.
- **Backend:** a Convex **dev** deployment and a Convex **production** deployment on the `dm-studios` team. The development app and the preview app use dev. Showlog uses production. Pushing code does not copy rows from one to the other.
- **Expo project:** `@dm-studios/showlog`.
- **GitHub:** private repo `delasimensah/showlog`.
- **Tickets:** in `docs/product/linear-tickets.md` only. No Linear team (Linear Free allows two active teams, and Kindred and PAAROS use both). Ticket ids are `SHOW-1`, `SHOW-2`, and so on. Branches are `feature/SHOW-n` for a ticket that exists in that file.
- **Not used:** Vercel (no website), Slack (GitHub emails are enough for one person), RevenueCat (nothing is sold), Firebase (no Android), UX Pilot (see section 8).

---

## 3. Sign-in

- **Email and password** through Convex Auth, the same as Ridgeway and Kindred.
- The app ships with the Convex web address inside it, so without sign-in anyone who pulled that address out of the app could read or change my list. Sign-in closes that.
- **One account only.** The first sign-up creates my account. After that, the server refuses any new sign-up.
- I sign in once on each install and stay signed in.
- Needs `JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL` on the Convex deployment before the first real sign-in. Steps: `docs/convex-auth-env.md` (copied at scaffold).
- **Out:** password reset by email (no email service). If I forget the password, I change it from the Convex dashboard.
- **Out:** Sign in with Apple, Google sign-in.

---

## 4. Where the show data comes from

Every outside thing this app depends on, with source, rights, and how it gets in.

**Show and episode information**

- **What:** show names, posters, status (running or ended), network or streaming service, average runtime, every season and episode with its title, summary, runtime, and air time.
- **Where from:** the [TVmaze public API](https://www.tvmaze.com/api). Free. No key. No account.
- **Rights:** the data is licensed CC BY-SA, which means anyone may use it for any purpose as long as TVmaze is credited. The app shows "Show data from TVmaze" with a link on the show screen and on Profile.
- **How it gets in:** when I add a show, a Convex action (a server function that may call outside services) fetches the show and its episodes from TVmaze and saves a copy in Convex. A daily job refreshes only the shows on my list that TVmaze says changed in the last day (`/updates/shows?since=day`).
- **Limits:** TVmaze allows at least 20 calls every 10 seconds from one address. On a 429 reply ("too many requests") the action waits a few seconds and tries again. Every call sends a User-Agent header that names this app.
- **Anime:** checked on 8 Oct 2026. One Piece (all 1,181 episodes, Fuji TV), That Time I Got Reincarnated as a Slime, Jujutsu Kaisen, Baki Hanma, and Solo Leveling all have full episode lists with titles, air times, pictures, and summaries. Two things differ from TV Time:
  - TVmaze numbers some long anime by year instead of by arc. One Piece's seasons are 1999 to 2026, so the latest episode is "2026 · E25", not "S23 | E14". Section 6 says how these show.
  - A search can return several shows with the same name. "One Piece" returns the 1999 Japanese anime, the 2023 Netflix live-action series, and two other Netflix shows. Search results show the type, language, year, and network so the right one is easy to pick.
- **Out:** TMDB, TheTVDB, Trakt, and IMDb as data sources.

**Posters and episode pictures**

- **Where from:** TVmaze's image servers. TVmaze says apps may link straight to them, and that image addresses never change.
- **How they show:** the phone loads them with `expo-image` and keeps them on the phone after the first load.
- **Not stored in Convex.** No pictures go into Convex file storage, so this app uses none of the team's monthly file-download allowance on the Free plan.

**Discover suggestions**

- **What:** a pool of popular, well-rated shows to suggest from.
- **Where from:** the TVmaze show index (`/shows?page=n`), which lists every show on TVmaze, about 85,000, with genres, type, language, rating, and a popularity score from 0 to 100. TVmaze has an "Anime" genre.
- **Rights:** the same TVmaze CC BY-SA credit.
- **How it gets in:** a weekly Convex job reads the index in small batches (about 350 pages, under TVmaze's 20 calls every 10 seconds) and keeps only shows with a popularity score of 85 or more and a poster. That is a few thousand shows, a few MB of database rows, and no file storage. The job also runs once during setup so Discover is not empty on day one.
- **Limit:** these are suggestions by genre, popularity, and rating. TVmaze has no "people who watched this also liked" data, so they are not true recommendations.
- **Out:** TMDB recommendations and a "Not interested" button. AI picks are in version one as **Pick for me**, described next.

**Pick for me (AI picks)**

- **What:** I answer three quick questions (mood, episode length, anime or not) and can add a few words of my own. Showlog finds up to five shows from the Discover pool whose descriptions best match my answers, and says in one sentence why each one fits. This is how the Discover limit above is answered: the picks come from meaning, not only genre.
- **How it works, in plain words:** every pool show's description is turned into an **embedding**, a list of numbers that stands for its meaning. My answers are turned into an embedding the same way. Convex **vector search** (a search that finds the stored lists of numbers closest to mine) returns the closest shows. A language model then writes the one-sentence reasons. This pattern is called **RAG** (retrieval-augmented generation): find the right facts first, then let the model write only from them.
- **Where from:** the [OpenAI API](https://developers.openai.com/api/docs). `text-embedding-3-small` shortened to 512 numbers makes the embeddings. `gpt-6-luna` with reasoning off writes the reasons. Both checked on 17 Nov 2026.
- **What is sent to OpenAI:** pool show names, genres, type, network, year, and TVmaze summaries, plus my three answers and my own words. Never my email, my list, or my ticks.
- **Rights:** the show text is TVmaze data under CC BY-SA. Showlog already credits TVmaze, and the embeddings and reasons stay inside my private app. Nothing is published.
- **How it gets in:** the weekly Discover refresh already downloads each show's summary and TVmaze update time. It now keeps them and makes an embedding only for a show that is new to the pool or that TVmaze changed since its last embedding. The first run after this change embeds the whole pool once.
- **Key:** `OPENAI_API_KEY` is an environment variable on the Convex dev deployment and on the Convex production deployment. The phone never holds it and never calls OpenAI.
- **Caps, so spending cannot run away:**
  - A separate OpenAI project named Showlog with a **hard monthly spend limit of $5**. OpenAI refuses calls once it is reached.
  - Prepaid OpenAI credit with **auto recharge off**, so OpenAI can never charge my card on its own.
  - **10 picks a day** in Showlog itself. The server refuses the eleventh with "That's today's 10 picks. Try again tomorrow."
  - Each reason call may write at most 600 tokens (a token is about three quarters of a word).
- **Convex stays free:** this uses no Convex AI gateway and no paid Convex feature. The Free plan has hard caps and never bills. The added storage and reads are sized in section 12 to stay far under those caps.
- **Out:** chat with the model, picks for several people at once, movies, picks from shows outside the Discover pool, and saving past picks.

**My watch history**

- Starts empty. There is no import from TV Time or Trakt.
- The **"Watched up to here"** button on any episode ticks that episode and every earlier one, so catching up a show I am halfway through takes one tap.

**Seed data:** none. Real shows from TVmaze are the content. Nothing fake ships.

---

## 5. Version one journeys

1. I sign in.
2. I search for a show by name, see matching shows with poster, type (for example Animation), language, first-air year, and network, and add one to my list.
3. **Discover** shows rows of shows I may like, picked from the suggestion pool. The same 20 stay until the next day. Shows already on my list are left out. I can add a show straight from its card, or open it to read about it first.
   - **Before I add any shows:** Popular anime, Popular right now (running shows), and Top rated (rating 8 or more).
   - **After I add shows:** Because you watch anime (only if anime is on my list), More of my two most common genres (for example "More Drama"), and Top rated.
   - Each row shows 20 shows picked at random from the 100 best-rated matches.
   - A show counts as anime if TVmaze gives it the Anime genre, or if it is Japanese animation.
4. On a show, I see its seasons and episodes. I tick an episode as watched, untick it, tick a whole season, or tap **Watched up to here**.
5. **Up next** (the home tab) shows one card per show where an aired episode is waiting for me. Each card shows the show name, the next episode (for example "S4 | E11" and "Milim's Friend"), how many more aired episodes wait after it ("+3"), and a button to tick that episode off. Shows I have not touched in 30 days or more sit in a lower section called **Paused for a while**.
6. On a show I have watched before, a **Where you left off** card shows the last episode I watched, when I watched it, and TVmaze's summary of that episode. Then the next episode to watch.
7. **Upcoming** lists episodes of my shows that have not aired yet, grouped Today, Tomorrow, the rest of this week by day name, then one heading per later day with that date ("19 Oct"). Each row shows the air time in my phone's time. The network is on the show screen. A season premiere is labelled. Shows with nothing scheduled show "No date yet".
8. **My shows** is a poster grid with a progress bar under each poster. I can sort by Last watched, Last added, or A to Z, and filter by Watching, Up to date, Not started, Watch later, Finished, or Stopped.
9. I can mark a show **Watch later**. It stays out of Up next until I tick one of its episodes or take it off Watch later.
10. I can mark a show **Stop watching** to move it out of Up next, Upcoming, and alerts without losing its history, and undo it.
11. **Profile** shows my stats: episodes watched, and Watch time in months, days, and hours.
12. I get a phone alert when a new episode of one of my shows airs.
13. I get a phone alert when a show on my list gets a new premiere date (for example "Severance season 3 premieres 12 January").
14. I can export my whole list and watch history as a file from Profile, so a shutdown never takes my history again.
15. **Pick for me**, opened from the Discover header, asks my mood, the episode length I want, and anime or not, with an optional line of my own words. It shows up to five shows that are not on my list, one at a time, each with its poster and one sentence on why it fits. I can add the show, open it, or go to the next pick.

---

## 6. Rules

- **Next episode** for a show = the first episode in airing order that has aired and that I have not ticked.
- **"+N"** = the number of aired episodes I have not ticked after the next episode. Hidden when it is zero.
- **Episode label:**
  - Normal shows: "S4 | E11". No overall episode number.
  - Shows whose seasons are years on TVmaze (season number 1900 or higher, such as One Piece): "Episode 1180" first, then "2026 · E25". The overall number is the episode's position among all the show's numbered episodes in airing order, which is how One Piece fans count. The season list shows the years.
- I cannot tick an episode that has not aired yet. It shows a countdown instead of a tick.
- **Specials** (episodes outside the numbered seasons) are left out. TVmaze leaves them out by default too.
- Ticking saves the time I ticked it. "Watched up to here" and "watch season" save the same time on every episode they tick.
- Rewatching is not tracked. An episode is watched or not.
- **Show status** comes from my ticks and TVmaze, except two that I set by hand:
  - Watching: I have ticked something, and an aired episode is waiting.
  - Up to date: I have seen every aired episode, and the show is still running.
  - Not started: nothing ticked.
  - Watch later: set by hand. Cleared when I tick an episode of that show.
  - Finished: the show has ended and I have seen every episode.
  - Stopped: set by hand. Cleared when I tap Resume.
- **Stats:**
  - Episodes watched = the number of episodes I have ticked.
  - Watch time = the runtime of every ticked episode, added up. An episode with no runtime on TVmaze uses the show's average runtime, and counts as zero if TVmaze has neither.
  - Shown as months, days, and hours, where a month is 30 days.
  - Stats start at zero, because history starts fresh. "Watched up to here" ticks count, so catching up a show also fills in its time.
- Removing a show from my list deletes my ticks for it, after a confirm step. Stop watching keeps them.
- Times come from TVmaze in UTC (world time) and show in my phone's time. An episode with a date and no time shows the date only.

---

## 7. Phone alerts

- **How:** Expo push. The phone gives Convex a push token (a long string that means "this phone"). Convex sends alerts through Expo, and Expo passes them to Apple.
- **New episode:** an hourly Convex job finds episodes of my shows that aired in the last hour and sends one alert per show. A streaming show that drops a whole season sends one alert ("Season 3 is out, 8 episodes"), not eight. Watch later and Stopped shows do not get these.
- **New premiere date:** the daily refresh notices when a show had no upcoming episode and now has one, and sends one alert. Watch later shows get these. Stopped shows do not.
- **Quiet hours:** no alerts between 22:00 and 08:00 my time. Alerts that come up in that window wait until 08:00. (A US show airing at 9 pm New York time airs at 1 or 2 am in Ghana.)
- **Tapping an alert** opens that show.
- **Settings:** alerts on or off for the whole app.
- **One-time setup:** an Apple push key on the Expo project. It is free with the Apple Developer membership I already have. Steps: `project-template/docs/client-delivery/push-notifications-setup.md`, the "iPhone (Apple)" part only. No Firebase, because there is no Android.
- **Proven on:** the preview app on my real iPhone. The simulator does not count.
- **Out:** a mute button for each show, email alerts.

---

## 8. Design

- **References:** my own TV Time screenshots, in `docs/design/references/tvtime/` (16 screens, listed in the README there), plus Mobbin screens pulled through the Mobbin MCP to keep the look current. TV Time sets the layouts I already know. Mobbin sets the modern finish.
- **Rights:** the screenshots are private design references in a private repo. They are not shipped in the app. Showlog does not copy TV Time's colours, logo, or name.
- **No UX Pilot.** No generated screens and no HTML exports for this project.
- **What the design step produces instead:**
  1. Kept Mobbin references, each mapped to a Showlog screen with a note on why it stayed.
  2. A locked design system: a palette from Color Hunt, Coolors, or Happy Hues (URL written down), one or two Google Fonts (URLs written down), spacing, corner radius, shadows, one visual differentiator, and things to avoid.
  3. `docs/design/screens.md`: one written spec per screen saying the layout, the content, and which TV Time and Mobbin references it follows.
- **Tickets** link the screen spec and the reference images instead of an HTML export.

---

## 9. Screens

1. Sign in, with Create account (works only once)
2. Watching (tab)
3. Upcoming (tab)
4. My shows (tab), with a sort and filter sheet
5. Discover (tab): rows of suggested shows with an Add button on each card. The same 20 stay until the next day.
6. Search (opened from Discover)
7. Show: header picture, name, seasons and network, progress bar, Where you left off card, seasons, and a menu with Watch later, Stop watching, and Remove from my list. For a show opened from Discover or Search that is not on my list yet: header picture, name, genres, rating, status, network, number of seasons, summary, and an Add button. Episodes appear once it is added.
8. Season: episode list with ticks, countdowns for unaired episodes, and Watched up to here
9. Episode sheet: picture, title, number, air date, summary, watched toggle, Watched up to here
10. Profile: stats, account email, alerts on or off, export my history, TVmaze credit, app version, Sign out in red
11. Empty states for Up next, Upcoming, and My shows. An empty Up next or an empty My shows sends you to Discover.

12. A short screen before the iPhone's own alert permission prompt, saying what alerts the app sends
13. Pick for me (opened from the Discover header): the three questions and my own words, then the picks one at a time with Add, open, and Next pick

Tabs, in order: Watching, Upcoming, Discover, My shows.

---

## 10. Out of version one

- Movies
- Specials
- Android, a website, iPad layouts, widgets, Apple Watch
- App Store or TestFlight release
- Import from TV Time or Trakt
- Ratings, reviews, comments, friends, favourites, custom lists, sharing
- "Where to watch" links to streaming apps. The network or service name shows as text only.
- Rewatch tracking
- Using the app with no internet. It needs a connection to load and save.
- More than one account
- Password reset by email

---

## 11. Phone packages to install before the first builds

From the rule that native packages go in before the first cloud build, so one development build and one preview build last the whole version:

- `expo-notifications` and `expo-device` (alerts and the push token)
- `expo-secure-store` (keeps the sign-in token on the phone)
- `expo-image` (posters, kept on the phone)
- `expo-haptics` (a small tap feel when ticking an episode)
- `@expo/ui` (native iPhone menus, sheets, pickers, and toggles, built with SwiftUI)
- `expo-file-system` and `expo-sharing` (export my history as a file)
- `expo-updates` (send code changes to the preview app without a new build). The preview app checks on open and reloads into that code before the first screen. The development app uses Metro and skips the check.
- `expo-splash-screen`, `expo-font`, and the chosen Google Font package
- App icon and splash screen, made before the first build

Then one iOS simulator development build and one iOS preview build. No Android build.

---

## 12. What it costs

One paid service, OpenAI, for Pick for me, with hard caps. Every other line below is a free plan or an account I already have.

- **OpenAI:** prepaid credit, auto recharge off, and a hard $5 monthly limit on the Showlog project. Expected spend is a few cents a month. Embedding the whole pool of about 6,700 shows is about 1.1 million tokens, about 2 cents, once on each Convex deployment. Each pick costs about 0.02 cents, so even 10 picks every day is about 6 cents a month. The weekly refresh re-embeds only changed shows, a fraction of a cent. Prices from the OpenAI pricing page on 17 Nov 2026: `text-embedding-3-small` $0.02 per million tokens, `gpt-6-luna` $0.10 per million tokens in and $0.50 out.

- **Apple Developer membership:** already paid. Needed for the preview app on my iPhone and for the push key. If the membership lapses, the preview app stops opening. The install's permission file (provisioning profile) also expires after about a year, and then the app needs a new preview build.
- **Expo Free:** 15 iOS cloud builds a month across the whole `dm-studios` account. This app needs 2 to start (1 simulator, 1 preview). Kindred has used none this month. Code changes after that go out as updates, which do not use builds.
- **Convex Free:** limits are shared by every project on the `dm-studios` team. This app stores no files. Its function calls are small: about 720 hourly alert checks and 30 daily refreshes a month, plus my own taps. The Free plan allows 1,000,000 function calls a month.
- **Convex Free, Pick for me:** about 32 MB of database rows and about 28 MB of vector search storage on each deployment, out of 0.5 GB each. The first embedding run writes about 32 MB of Database I/O once. After that, the weekly re-embeds and 10 picks a day stay under about 90 MB of the 1 GB monthly Database I/O, and each pick uses about 0.03 of the 3,000 monthly search query-GB. No new TVmaze calls.
- **TVmaze:** free, no account. Discover adds about 350 TVmaze calls a week and a few MB of database rows.
- **GitHub:** free private repo.
- **Mobbin:** my existing plan.

---

## 13. Risks

- **TVmaze data can be wrong or late**, for example a missing air time or runtime. The app shows what TVmaze has. A fix on TVmaze reaches the app within a day.
- **TVmaze could shut down**, like TV Time. My shows, episodes, and ticks are copies in Convex, so the history survives. The export file is the second copy.
- **Alerts depend on the Apple push key.** If that setup is not done, alerts cannot be tested. It comes before the alerts ticket.
- **Shared free meters.** Kindred and PAAROS share the same Convex team and Expo account. A heavy month on Kindred could use up builds this app needs.
- **OpenAI can be down, change a model, or hit the $5 limit.** Pick for me then says "Pick for me isn't available right now." Everything else in Showlog keeps working, because nothing else calls OpenAI. If OpenAI fails only while writing the reasons, the picks still show without a reason. OpenAI's hard limit can let a little extra through before it stops calls, which is why the in-app 10-a-day limit also exists.

---

## 14. Next steps after approval

1. Approve this file, the questionnaire, and the product requirements.
2. Scaffold `6.showlog` from the template: phone app only, Convex, Convex Auth, blank first screen with the name and one line.
3. Private GitHub repo.
4. Expo project `@dm-studios/showlog`.
5. Convex project on the `dm-studios` team, plus the three auth keys.
6. System design.
7. Screen design: Mobbin references next to the TV Time screenshots, the design system, and `docs/design/screens.md`.
8. Tickets in `docs/product/linear-tickets.md`.
9. App icon, phone packages, one development build, one preview build.
10. Build, one ticket at a time.
