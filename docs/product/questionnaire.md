# Showlog — requirements questionnaire

**Status:** Approved on 8 Oct 2026. Discover added the same day. Answers come from `locked-decisions.md`.
**Date:** 8 Oct 2026

---

## 1. Product and goal

**What is it in one sentence?** An iPhone app where I find the TV shows I watch, add them to my list, tick off the episodes I have seen, see where I left off, and get told when a new episode is out.

**What problem does it solve?** TV Time shut down, and it was how I knew where I was in every show and when new episodes were coming. Trakt does this but its screens are too busy.

**Who owns it?** Delasi Mensah.

---

## 2. Users and platforms

**Users:** me, one person.

**Platforms:** iPhone only. No website, no Android.

**Devices:** my iPhone, on whatever iOS version the Expo SDK at scaffold supports. iPhone screen sizes only, no iPad layout.

**Different experiences per user type?** No. One user, one role.

---

## 3. Version one and "done"

**Done looks like:** the preview app on my iPhone holds every show I watch, Up next tells me what to watch, Upcoming tells me what is coming, and an alert arrives when a new episode airs.

**Absolute minimum:** search and add a show, tick episodes, Up next, Where you left off. Then My shows and Upcoming.

**Not in version one:** movies, specials, Android, a website, import from TV Time or Trakt, ratings, social, favourites, custom lists, "where to watch" links, rewatch tracking, offline use, more than one account, password reset by email, App Store release.

---

## 4. Existing vs new

**What exists:** the studio template (Expo, Convex patterns from Ridgeway and Kindred), my Apple Developer membership, the `dm-studios` Expo account and Convex team, and 16 TV Time screenshots I saved before it shut down.

**What is new:** the whole app.

**Outside data:** the TVmaze public API. No key, no account.

---

## 5. Main flows

In order of importance:

1. Search a show and add it to my list.
2. Tick an episode, a season, or everything up to an episode.
3. See what to watch next on each show, with how many more are waiting.
4. See where I left off on a show I have not watched in a while.
5. See all my shows as a poster grid, sorted and filtered by status.
6. See upcoming episodes for my shows.
7. Discover shows I may like, including anime, even before I have added anything.
8. Mark a show Watch later, or stop watching it without losing its history.
9. Get an alert when a new episode airs or a premiere date is announced.
10. See my stats: episodes watched and Watch time.
11. Export my list and history as a file.

**Nouns:** show, season, episode, my show (a show on my list), watched episode, push token.

**Must-have vs later:** everything above is version one. Import and specials are later.

---

## 6. Data and integrations

**Stored:** a weekly pool of a few thousand popular shows for Discover, a copy of each show on my list and its episodes from TVmaze, which shows are on my list with their Watch later and Stopped state, each episode I ticked with the time, my phone's push token, and my time zone for quiet hours.

**Integrations:** TVmaze (show data and the Discover pool, CC BY-SA, credit required), Expo push (alerts through Apple), Convex Auth (sign-in).

**Rate limits:** TVmaze allows at least 20 calls every 10 seconds per address. Retry after a pause on a 429 reply.

**Import or migrate?** No. History starts empty.

---

## 7. Rules, permissions, and compliance

**Who can see what?** Only my signed-in account. The server allows one account and refuses further sign-ups.

**Approvals or multi-step flows?** None.

**Compliance:** none beyond crediting TVmaze. The only personal data is my email address.

---

## 8. Constraints

**Deadline:** none.

**Budget:** zero. No new subscriptions or paid plans.

**Non-negotiables:** simple screens, fewer controls than Trakt. Free to run.

**Auth:** email and password through Convex Auth.

**Stack:** studio template. Expo phone app, Convex backend.

---

## 9. Non-functional

**Scale:** one user, maybe 30 to 100 shows, a few thousand episodes. Some anime runs past 1,000 episodes.

**Availability:** best effort. It is my own app.

**Speed:** ticking an episode should feel instant. Search results within about a second.

**Offline:** not in version one. The app needs a connection.

**Known risks:** TVmaze data gaps, TVmaze shutting down (copies in Convex and the export cover it), alerts depending on the Apple push key setup.

---

## 10. Success and priorities

**Success:** I stop opening Trakt and use Showlog for every show for a month.

**Last thing to cut:** Up next and episode ticking.

**Phase 2 ideas:** specials, a mute button for each show, "where to watch" links, rewatch tracking.

---

## 11. Design, content, and ops

**Designs:** my TV Time screenshots for layout, Mobbin references for a modern finish, a locked design system, and a written spec per screen. No UX Pilot.

**Copy and assets:** I write the copy with the agent. Posters come from TVmaze. The app icon is made with the studio icon guide before the first build.

**Who runs it:** me. Expo preview build on my iPhone, Convex dev deployment.

**Hosting:** Convex Free on the `dm-studios` team, Expo Free on the `dm-studios` account.
