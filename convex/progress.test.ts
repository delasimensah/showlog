/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { recomputeProgress } from "./progress";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

describe("recomputeProgress", () => {
  it("sets the aired count and the next episode on a newly added show", async () => {
    const t = convexTest(schema, modules);
    const now = Date.UTC(2026, 9, 9, 15);

    const myShowId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "Example",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 11,
        season: 1,
        number: 1,
        order: 1,
        name: "Aired",
        airTimeKnown: true,
        airsAt: Date.UTC(2026, 9, 8, 20),
      });
      await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 12,
        season: 1,
        number: 2,
        order: 2,
        name: "Yesterday",
        airTimeKnown: false,
        airsAt: Date.parse("2026-10-08T00:00:00.000Z"),
      });
      await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 13,
        season: 1,
        number: 3,
        order: 3,
        name: "Today, no time",
        airTimeKnown: false,
        airsAt: Date.parse("2026-10-09T00:00:00.000Z"),
      });
      await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 14,
        season: 1,
        number: 4,
        order: 4,
        name: "Later",
        airTimeKnown: true,
        airsAt: Date.UTC(2026, 9, 10, 20),
      });
      return await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: now,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
    });

    await t.run(async (ctx) => {
      await recomputeProgress(ctx, myShowId, now);
    });

    const myShow = await t.run(async (ctx) => {
      return await ctx.db.get(myShowId);
    });
    const next = await t.run(async (ctx) => {
      if (myShow?.nextEpisodeId === undefined) return null;
      return await ctx.db.get(myShow.nextEpisodeId);
    });

    expect(myShow?.airedCount).toBe(2);
    expect(myShow?.watchedCount).toBe(0);
    expect(myShow?.waitingAfterNext).toBe(1);
    expect(myShow?.lastWatchedAt).toBeUndefined();
    expect(next?.order).toBe(1);
  });
});
