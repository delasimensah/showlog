/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

describe("account", () => {
  it("returns the signed-in user's name and email", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });

    const account = await t
      .withIdentity({ subject: `${userId}|test-session` })
      .query(api.profile.account, {});

    expect(account).toEqual({ name: "Ada", email: "me@example.com" });
  });
});

describe("stats", () => {
  it("is zero before any episode is ticked", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { name: "Ada" });
    });

    const stats = await t
      .withIdentity({ subject: `${userId}|test-session` })
      .query(api.profile.stats, {});

    expect(stats).toEqual({ episodesWatched: 0, minutesWatched: 0 });
  });

  it("matches the ticks, using the show average when a runtime is missing", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "The Bear",
        genres: ["Drama"],
        status: "Running",
        seasons: [{ number: 1, episodeCount: 2, firstOrder: 1 }],
        yearSeasons: false,
        averageRuntime: 40,
        tvmazeUpdatedAt: 0,
      });
      const episodeId = await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 11,
        season: 1,
        number: 2,
        order: 1,
        name: "The Review",
        airTimeKnown: true,
        airsAt: Date.now() - 60_000,
      });
      await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 12,
        season: 1,
        number: 3,
        order: 2,
        name: "Next",
        runtime: 30,
        airTimeKnown: true,
        airsAt: Date.now() - 60_000,
      });
      const myShowId = await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: 1_700_000_000_000,
        watchLater: false,
        airedCount: 2,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      return { userId, episodeId, myShowId };
    });
    const user = t.withIdentity({ subject: `${seeded.userId}|test-session` });

    await user.mutation(api.watching.tick, { episodeId: seeded.episodeId });

    const stats = await user.query(api.profile.stats, {});
    expect(stats).toEqual({ episodesWatched: 1, minutesWatched: 40 });

    const history = JSON.parse(
      await user.action(api.profile.exportHistory, {})
    ) as {
      shows: { name: string; addedAt: number; status: string }[];
      episodes: {
        show: string;
        season: number;
        number: number;
        title: string;
        watchedAt: number;
      }[];
    };
    expect(history.shows).toEqual([
      { name: "The Bear", addedAt: 1_700_000_000_000, status: "Watching" },
    ]);
    expect(history.episodes).toEqual([
      {
        show: "The Bear",
        season: 1,
        number: 2,
        title: "The Review",
        watchedAt: history.episodes[0]?.watchedAt,
      },
    ]);
    expect(history.episodes[0]?.watchedAt).toEqual(expect.any(Number));
  });
});
