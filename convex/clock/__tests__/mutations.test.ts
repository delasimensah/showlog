/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { internal } from "../../_generated/api";
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
  "clock"
);

describe("hourly", () => {
  it("makes an episode that just aired the next episode", async () => {
    const t = convexTest(schema, modules);
    const now = Date.UTC(2026, 9, 9, 15);
    const ids = await t.run(async (ctx) => {
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
      const first = await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 11,
        season: 1,
        number: 1,
        order: 1,
        name: "Already on",
        airTimeKnown: true,
        airsAt: now - 2 * 24 * 60 * 60 * 1000,
      });
      const second = await ctx.db.insert("episodes", {
        showId,
        tvmazeId: 12,
        season: 1,
        number: 2,
        order: 2,
        name: "Just aired",
        airTimeKnown: true,
        airsAt: now - 20 * 60 * 1000,
      });
      await ctx.db.insert("watchedEpisodes", {
        userId,
        showId,
        episodeId: first,
        season: 1,
        watchedAt: now - 24 * 60 * 60 * 1000,
        minutes: 20,
      });
      const myShowId = await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: now,
        watchLater: false,
        airedCount: 1,
        watchedCount: 1,
        waitingAfterNext: 0,
      });
      return { myShowId, second };
    });

    await t.mutation(internal.clock.mutations.hourly, { now });

    const myShow = await t.run(async (ctx) => ctx.db.get(ids.myShowId));
    expect(myShow?.nextEpisodeId).toBe(ids.second);
    expect(myShow?.airedCount).toBe(2);
    expect(myShow?.waitingAfterNext).toBe(0);
  });
});
