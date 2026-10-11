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

describe("get", () => {
  it("returns year seasons from the saved summary and nothing when it is not mine", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });
    const showId = await t.run(async (ctx) => {
      return await ctx.db.insert("shows", {
        tvmazeId: 1505,
        name: "One Piece",
        genres: ["Action"],
        status: "Running",
        network: "Fuji TV",
        summary: "Pirates.",
        seasons: [
          { number: 1999, episodeCount: 12, firstOrder: 1 },
          { number: 2026, episodeCount: 8, firstOrder: 13 },
        ],
        yearSeasons: true,
        tvmazeUpdatedAt: 1,
      });
    });
    await t.run(async (ctx) => {
      await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: 1,
        watchLater: false,
        airedCount: 20,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
    });
    const asUser = t.withIdentity({ subject: `${userId}|test-session` });

    const mine = await asUser.query(api.shows.queries.get, { tvmazeId: 1505 });
    const missing = await asUser.query(api.shows.queries.get, {
      tvmazeId: 999,
    });

    expect(mine?.yearSeasons).toBe(true);
    expect(mine?.seasons).toEqual([
      { number: 1999, episodeCount: 12, watchedCount: 0 },
      { number: 2026, episodeCount: 8, watchedCount: 0 },
    ]);
    expect(mine?.airedCount).toBe(20);
    expect(mine?.leftOff).toBeNull();
    expect(mine?.upNext).toBeNull();
    expect(missing).toBeNull();
  });
});
