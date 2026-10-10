/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import type { Id } from "./_generated/dataModel";
import { recomputeProgress, tickProgress, untickProgress } from "./progress";
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

describe("tickProgress and untickProgress", () => {
  it("match a full recompute after every tick and untick, in any order", async () => {
    const t = convexTest(schema, modules);
    const now = Date.UTC(2026, 9, 9, 15);

    const { myShowId, episodeIds } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "Example",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      const episodeIds: Id<"episodes">[] = [];
      for (let order = 1; order <= 8; order += 1) {
        episodeIds.push(
          await ctx.db.insert("episodes", {
            showId,
            tvmazeId: 10 + order,
            season: 1,
            number: order,
            order,
            name: `Episode ${order}`,
            airTimeKnown: true,
            airsAt: order <= 6 ? Date.UTC(2026, 9, order) : now + order * 1000,
          })
        );
      }
      const myShowId = await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: now,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      await recomputeProgress(ctx, myShowId, now);
      return { myShowId, episodeIds };
    });

    const steps: Array<["tick" | "untick", number]> = [
      ["tick", 1],
      ["tick", 3],
      ["tick", 2],
      ["untick", 3],
      ["tick", 6],
      ["untick", 6],
      ["tick", 4],
      ["tick", 5],
      ["tick", 3],
      ["tick", 6],
      ["untick", 1],
      ["untick", 2],
      ["untick", 6],
      ["untick", 5],
      ["untick", 4],
      ["untick", 3],
    ];

    for (const [index, [action, order]] of steps.entries()) {
      const episodeId = episodeIds[order - 1]!;
      const { incremental, full } = await t.run(async (ctx) => {
        const myShow = await ctx.db.get(myShowId);
        const episode = await ctx.db.get(episodeId);
        if (myShow === null || episode === null) throw new Error("missing");
        const watchedAt = 1000 + index;
        if (action === "tick") {
          await ctx.db.insert("watchedEpisodes", {
            userId: myShow.userId,
            showId: myShow.showId,
            episodeId,
            season: 1,
            watchedAt,
            minutes: 30,
          });
          await tickProgress(ctx, myShow, episode, watchedAt, now);
        } else {
          const tick = await ctx.db
            .query("watchedEpisodes")
            .withIndex("by_user_episode", (q) =>
              q.eq("userId", myShow.userId).eq("episodeId", episodeId)
            )
            .unique();
          if (tick !== null) await ctx.db.delete(tick._id);
          await untickProgress(ctx, myShow, episode, now);
        }
        const pick = (row: typeof myShow | null) => ({
          watchedCount: row?.watchedCount,
          airedCount: row?.airedCount,
          waitingAfterNext: row?.waitingAfterNext,
          nextEpisodeId: row?.nextEpisodeId,
          lastWatchedAt: row?.lastWatchedAt,
          lastWatchedEpisodeId: row?.lastWatchedEpisodeId,
        });
        const incremental = pick(await ctx.db.get(myShowId));
        await recomputeProgress(ctx, myShowId, now);
        return { incremental, full: pick(await ctx.db.get(myShowId)) };
      });
      expect({ step: `${action} ${order}`, ...incremental }).toEqual({
        step: `${action} ${order}`,
        ...full,
      });
    }
  });

  it("moves to the next episode of a show with over a thousand episodes", async () => {
    const t = convexTest(schema, modules);
    const now = Date.UTC(2026, 9, 9, 15);

    const result = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "Long",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      const ids: Id<"episodes">[] = [];
      for (let order = 1; order <= 1200; order += 1) {
        ids.push(
          await ctx.db.insert("episodes", {
            showId,
            tvmazeId: 100 + order,
            season: 1,
            number: order,
            order,
            name: `Episode ${order}`,
            airTimeKnown: true,
            airsAt: Date.UTC(2026, 0, 1) + order,
          })
        );
      }
      const myShowId = await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: now,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      await recomputeProgress(ctx, myShowId, now);

      const myShow = await ctx.db.get(myShowId);
      const first = await ctx.db.get(ids[0]!);
      if (myShow === null || first === null) throw new Error("missing");
      await ctx.db.insert("watchedEpisodes", {
        userId,
        showId,
        episodeId: first._id,
        season: 1,
        watchedAt: now,
        minutes: 0,
      });
      await tickProgress(ctx, myShow, first, now, now);
      return {
        row: await ctx.db.get(myShowId),
        second: ids[1],
      };
    });

    expect(result.row?.nextEpisodeId).toBe(result.second);
    expect(result.row?.waitingAfterNext).toBe(1198);
    expect(result.row?.watchedCount).toBe(1);
  });
});
