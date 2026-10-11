/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import schema from "../../schema";
import { modulesFromConvexRoot } from "../../testModules";

const modules = modulesFromConvexRoot(
  import.meta.glob([
    "../../*.ts",
    "../../*/*.ts",
    "../../lib/*.ts",
    "../../_generated/**/*.js",
    "!../../*.test.ts",
    "!../../*/*.test.ts",
  ]),
  "shows"
);

afterEach(() => {
  vi.unstubAllGlobals();
});

function episode(index: number) {
  return {
    id: index + 1,
    name: `Episode ${index + 1}`,
    season: 1999,
    number: index + 1,
    type: "regular",
    airdate: "1999-10-20",
    airstamp: "1999-10-20T10:00:00Z",
    runtime: 24,
  };
}

function showPayload(episodeCount: number) {
  return {
    id: 1505,
    name: "One Piece",
    type: "Animation",
    language: "Japanese",
    genres: ["Action", "Anime"],
    status: "Running",
    averageRuntime: 24,
    premiered: "1999-10-20",
    rating: { average: 8.7 },
    network: { name: "Fuji TV", country: { timezone: "Asia/Tokyo" } },
    image: { original: "https://img.example/one-piece.jpg" },
    summary: "<p>Pirates.</p>",
    updated: 1_700_000_000,
    _embedded: {
      images: [],
      episodes: Array.from({ length: episodeCount }, (_, index) =>
        episode(index)
      ),
    },
  };
}

describe("watch later, stop, and remove", () => {
  it("keeps a Watch later show out of Up next until an episode is ticked", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedList(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.shows.mutations.setWatchLater, {
      myShowId: seeded.myShowId,
      on: true,
    });

    const hidden = await user.query(api.lists.queries.upNext, {});
    const coming = await user.query(api.lists.queries.upcoming, { now });
    const grid = await user.query(api.lists.queries.myShows, { sort: "name" });
    expect(hidden.upNext).toHaveLength(0);
    expect(coming.episodes.map((row) => row.showName)).toEqual(["Slow Horses"]);
    expect(grid[0]?.status).toBe("Watch later");

    await user.mutation(api.watching.mutations.tick, {
      episodeId: seeded.next,
    });
    const saved = await t.run(async (ctx) => ctx.db.get(seeded.myShowId));
    const shown = await user.query(api.lists.queries.upNext, {});
    expect(saved?.watchLater).toBe(false);
    expect(shown.upNext.map((row) => row.showName)).toEqual(["Slow Horses"]);
  });

  it("takes a stopped show out of both lists and brings it back", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedList(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.shows.mutations.stop, {
      myShowId: seeded.myShowId,
    });
    const hidden = await user.query(api.lists.queries.upNext, {});
    const coming = await user.query(api.lists.queries.upcoming, { now });
    const grid = await user.query(api.lists.queries.myShows, { sort: "name" });
    const ticks = await t.run(async (ctx) =>
      ctx.db.query("watchedEpisodes").collect()
    );
    expect(hidden.upNext).toHaveLength(0);
    expect(coming.episodes).toHaveLength(0);
    expect(grid[0]?.status).toBe("Stopped");
    expect(ticks).toHaveLength(1);

    await user.mutation(api.shows.mutations.resume, {
      myShowId: seeded.myShowId,
    });
    const shown = await user.query(api.lists.queries.upNext, {});
    const back = await user.query(api.lists.queries.upcoming, { now });
    const resumed = await t.run(async (ctx) => ctx.db.get(seeded.myShowId));
    expect(shown.upNext.map((row) => row.showName)).toEqual(["Slow Horses"]);
    expect(back.episodes).toHaveLength(1);
    expect(resumed?.stoppedAt).toBeUndefined();
  });

  it("deletes the show, the ticks, and the time they added", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedList(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.shows.mutations.remove, {
      myShowId: seeded.myShowId,
    });
    vi.useFakeTimers();
    await t.finishAllScheduledFunctions(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();

    const saved = await t.run(async (ctx) => {
      const shows = await ctx.db.query("shows").collect();
      const episodes = await ctx.db.query("episodes").collect();
      const mine = await ctx.db.query("myShows").collect();
      const ticks = await ctx.db.query("watchedEpisodes").collect();
      const stats = await ctx.db.query("userStats").collect();
      return { shows, episodes, mine, ticks, stats };
    });
    expect(saved.shows).toHaveLength(0);
    expect(saved.episodes).toHaveLength(0);
    expect(saved.mine).toHaveLength(0);
    expect(saved.ticks).toHaveLength(0);
    expect(saved.stats[0]?.episodesWatched).toBe(0);
    expect(saved.stats[0]?.minutesWatched).toBe(0);
  });

  it("keeps the show copy when someone else still has it", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedList(t);
    await t.run(async (ctx) => {
      const other = await ctx.db.insert("users", {
        name: "Bea",
        email: "bea@example.com",
      });
      await ctx.db.insert("myShows", {
        userId: other,
        showId: seeded.showId,
        addedAt: past,
        watchLater: false,
        airedCount: 2,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
    });

    await asUser(t, seeded.userId).mutation(api.shows.mutations.remove, {
      myShowId: seeded.myShowId,
    });
    vi.useFakeTimers();
    await t.finishAllScheduledFunctions(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();

    const show = await t.run(async (ctx) => ctx.db.get(seeded.showId));
    expect(show?.name).toBe("Slow Horses");
  });

  it("refuses a show that is not on my list", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedList(t);
    const other = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Bea",
        email: "bea@example.com",
      });
    });

    await expect(
      asUser(t, other).mutation(api.shows.mutations.setWatchLater, {
        myShowId: seeded.myShowId,
        on: true,
      })
    ).rejects.toBeInstanceOf(ConvexError);
  });
});

const past = Date.UTC(2026, 0, 1);
const future = Date.UTC(2026, 11, 1);
const now = Date.UTC(2026, 5, 1);

async function seedList(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name: "Ada",
      email: "me@example.com",
    });
    const showId = await ctx.db.insert("shows", {
      tvmazeId: 82,
      name: "Slow Horses",
      genres: ["Drama"],
      status: "Running",
      seasons: [],
      yearSeasons: false,
      tvmazeUpdatedAt: 0,
    });
    const aired = await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 820,
      season: 1,
      number: 1,
      order: 1,
      name: "Failure's Contagious",
      runtime: 50,
      airTimeKnown: true,
      airsAt: past,
    });
    const next = await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 821,
      season: 1,
      number: 2,
      order: 2,
      name: "Work Drinks",
      runtime: 50,
      airTimeKnown: true,
      airsAt: past,
    });
    await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 822,
      season: 1,
      number: 3,
      order: 3,
      name: "Bad Tradecraft",
      runtime: 50,
      airTimeKnown: true,
      airsAt: past,
    });
    await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 823,
      season: 2,
      number: 1,
      order: 4,
      name: "Later",
      runtime: 50,
      airTimeKnown: true,
      airsAt: future,
    });
    const myShowId = await ctx.db.insert("myShows", {
      userId,
      showId,
      addedAt: past,
      watchLater: false,
      airedCount: 3,
      watchedCount: 1,
      waitingAfterNext: 1,
      nextEpisodeId: next,
      lastWatchedAt: Date.now() - 24 * 60 * 60 * 1000,
    });
    await ctx.db.insert("watchedEpisodes", {
      userId,
      showId,
      episodeId: aired,
      season: 1,
      watchedAt: past,
      minutes: 50,
    });
    await ctx.db.insert("userStats", {
      userId,
      episodesWatched: 1,
      minutesWatched: 50,
    });
    return { userId, showId, myShowId, next };
  });
}

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: `${userId}|test-session` });
}
