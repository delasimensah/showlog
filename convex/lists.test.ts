/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

async function addShow(
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">,
  input: {
    name: string;
    tvmazeId: number;
    watchedCount: number;
    lastWatchedAt?: number;
    addedAt: number;
    watchLater?: boolean;
    stoppedAt?: number;
    waitingAfterNext?: number;
    withNext?: boolean;
  }
) {
  await t.run(async (ctx) => {
    const showId = await ctx.db.insert("shows", {
      tvmazeId: input.tvmazeId,
      name: input.name,
      genres: [],
      status: "Running",
      seasons: [],
      yearSeasons: false,
      tvmazeUpdatedAt: 0,
    });
    const episodeId =
      input.withNext === false
        ? undefined
        : await ctx.db.insert("episodes", {
            showId,
            tvmazeId: input.tvmazeId * 10,
            season: 1,
            number: 1,
            order: 1,
            name: `${input.name} episode`,
            airTimeKnown: true,
            airsAt: now - DAY,
          });
    await ctx.db.insert("myShows", {
      userId,
      showId,
      addedAt: input.addedAt,
      watchLater: input.watchLater ?? false,
      stoppedAt: input.stoppedAt,
      airedCount: 1,
      watchedCount: input.watchedCount,
      waitingAfterNext: input.waitingAfterNext ?? 0,
      lastWatchedAt: input.lastWatchedAt,
      nextEpisodeId: episodeId,
    });
  });
}

describe("upNext", () => {
  it("splits aired episodes into the three sections", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });
    await addShow(t, userId, {
      name: "Recent",
      tvmazeId: 1,
      watchedCount: 1,
      lastWatchedAt: now - 2 * DAY,
      addedAt: now - 10 * DAY,
      waitingAfterNext: 3,
    });
    await addShow(t, userId, {
      name: "Newer",
      tvmazeId: 2,
      watchedCount: 1,
      lastWatchedAt: now - DAY,
      addedAt: now - 10 * DAY,
    });
    await addShow(t, userId, {
      name: "Paused",
      tvmazeId: 3,
      watchedCount: 1,
      lastWatchedAt: now - 40 * DAY,
      addedAt: now - 50 * DAY,
    });
    await addShow(t, userId, {
      name: "Fresh",
      tvmazeId: 4,
      watchedCount: 0,
      addedAt: now - DAY,
    });
    await addShow(t, userId, {
      name: "Older add",
      tvmazeId: 5,
      watchedCount: 0,
      addedAt: now - 5 * DAY,
    });
    await addShow(t, userId, {
      name: "Later",
      tvmazeId: 6,
      watchedCount: 0,
      addedAt: now,
      watchLater: true,
    });
    await addShow(t, userId, {
      name: "Stopped",
      tvmazeId: 7,
      watchedCount: 1,
      lastWatchedAt: now - DAY,
      addedAt: now,
      stoppedAt: now,
    });
    await addShow(t, userId, {
      name: "Caught up",
      tvmazeId: 8,
      watchedCount: 1,
      lastWatchedAt: now - DAY,
      addedAt: now,
      withNext: false,
    });

    const list = await t
      .withIdentity({ subject: `${userId}|test-session` })
      .query(api.lists.upNext, {});

    expect(list.upNext.map((row) => row.showName)).toEqual(["Newer", "Recent"]);
    expect(list.upNext[1]?.waitingAfterNext).toBe(3);
    expect(list.paused.map((row) => row.showName)).toEqual(["Paused"]);
    expect(list.notStarted.map((row) => row.showName)).toEqual([
      "Fresh",
      "Older add",
    ]);
  });
});
