/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

const past = Date.now() - 2 * 24 * 60 * 60 * 1000;
const future = Date.now() + 5 * 24 * 60 * 60 * 1000;

async function seed(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name: "Ada",
      email: "me@example.com",
    });
    const showId = await ctx.db.insert("shows", {
      tvmazeId: 1,
      name: "Example",
      genres: [],
      status: "Running",
      seasons: [
        { number: 1, episodeCount: 3, firstOrder: 1 },
        { number: 2, episodeCount: 1, firstOrder: 4 },
      ],
      yearSeasons: false,
      averageRuntime: 40,
      tvmazeUpdatedAt: 0,
    });
    const first = await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 11,
      season: 1,
      number: 1,
      order: 1,
      name: "One",
      runtime: 24,
      airTimeKnown: true,
      airsAt: past,
    });
    const second = await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 12,
      season: 1,
      number: 2,
      order: 2,
      name: "Two",
      airTimeKnown: true,
      airsAt: past,
    });
    const later = await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 13,
      season: 1,
      number: 3,
      order: 3,
      name: "Later",
      airTimeKnown: true,
      airsAt: future,
    });
    const nextSeason = await ctx.db.insert("episodes", {
      showId,
      tvmazeId: 21,
      season: 2,
      number: 1,
      order: 4,
      name: "Next season",
      runtime: 30,
      airTimeKnown: true,
      airsAt: past,
    });
    const myShowId = await ctx.db.insert("myShows", {
      userId,
      showId,
      addedAt: past,
      watchLater: true,
      airedCount: 0,
      watchedCount: 0,
      waitingAfterNext: 0,
    });
    return { userId, showId, myShowId, first, second, later, nextSeason };
  });
}

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: `${userId}|test-session` });
}

describe("tick", () => {
  it("saves one row when the same episode is ticked twice", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seed(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.watching.tick, { episodeId: seeded.first });
    await user.mutation(api.watching.tick, { episodeId: seeded.first });

    const saved = await t.run(async (ctx) => {
      const ticks = await ctx.db.query("watchedEpisodes").collect();
      const myShow = await ctx.db.get(seeded.myShowId);
      const stats = await ctx.db.query("userStats").collect();
      return { ticks, myShow, stats };
    });

    expect(saved.ticks).toHaveLength(1);
    expect(saved.ticks[0]?.minutes).toBe(24);
    expect(saved.myShow?.watchedCount).toBe(1);
    expect(saved.myShow?.airedCount).toBe(3);
    expect(saved.myShow?.watchLater).toBe(false);
    expect(saved.stats[0]?.episodesWatched).toBe(1);
    expect(saved.stats[0]?.minutesWatched).toBe(24);
  });

  it("refuses an episode that has not aired", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seed(t);
    const user = asUser(t, seeded.userId);

    await expect(
      user.mutation(api.watching.tick, { episodeId: seeded.later })
    ).rejects.toBeInstanceOf(ConvexError);
    const ticks = await t.run(async (ctx) =>
      ctx.db.query("watchedEpisodes").collect()
    );
    expect(ticks).toHaveLength(0);
  });
});

describe("untick", () => {
  it("removes the tick and the progress", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seed(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.watching.tick, { episodeId: seeded.first });
    await user.mutation(api.watching.untick, { episodeId: seeded.first });

    const saved = await t.run(async (ctx) => {
      const ticks = await ctx.db.query("watchedEpisodes").collect();
      const myShow = await ctx.db.get(seeded.myShowId);
      const stats = await ctx.db.query("userStats").collect();
      return { ticks, myShow, stats };
    });

    expect(saved.ticks).toHaveLength(0);
    expect(saved.myShow?.watchedCount).toBe(0);
    expect(saved.stats[0]?.episodesWatched).toBe(0);
    expect(saved.stats[0]?.minutesWatched).toBe(0);
  });
});

describe("watchSeason", () => {
  it("ticks every aired episode in the season at one time", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seed(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.watching.watchSeason, {
      showId: seeded.showId,
      season: 1,
    });

    const saved = await t.run(async (ctx) => {
      const ticks = await ctx.db.query("watchedEpisodes").collect();
      const myShow = await ctx.db.get(seeded.myShowId);
      return { ticks, myShow };
    });

    expect(saved.ticks.map((tick) => tick.episodeId).sort()).toEqual(
      [seeded.first, seeded.second].sort()
    );
    expect(saved.ticks[0]?.watchedAt).toBe(saved.ticks[1]?.watchedAt);
    expect(
      saved.ticks.find((tick) => tick.episodeId === seeded.second)?.minutes
    ).toBe(40);
    expect(saved.myShow?.watchedCount).toBe(2);
    expect(saved.myShow?.nextEpisodeId).toBe(seeded.nextSeason);
  });
});

describe("watchUpTo", () => {
  it("ticks that episode and every earlier aired one", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seed(t);
    const user = asUser(t, seeded.userId);

    await user.mutation(api.watching.watchUpTo, {
      episodeId: seeded.nextSeason,
    });

    const ticks = await t.run(async (ctx) =>
      ctx.db.query("watchedEpisodes").collect()
    );
    expect(ticks.map((tick) => tick.episodeId).sort()).toEqual(
      [seeded.first, seeded.second, seeded.nextSeason].sort()
    );
    expect(new Set(ticks.map((tick) => tick.watchedAt)).size).toBe(1);
  });
});

describe("season", () => {
  it("returns the season with a watched flag", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seed(t);
    const user = asUser(t, seeded.userId);
    await user.mutation(api.watching.tick, { episodeId: seeded.first });

    const season = await user.query(api.shows.season, {
      showId: seeded.showId,
      season: 1,
    });

    expect(season.showName).toBe("Example");
    expect(season.episodes.map((episode) => episode.watched)).toEqual([
      true,
      false,
      false,
    ]);
    expect(season.episodes[2]?.aired).toBe(false);
  });
});
