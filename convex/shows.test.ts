/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { chunkEpisodes } from "./shows";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

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

describe("chunkEpisodes", () => {
  it("splits a long show into batches of 500", () => {
    const batches = chunkEpisodes(
      Array.from({ length: 1101 }, (_, index) => index)
    );
    expect(batches.map((batch) => batch.length)).toEqual([500, 500, 101]);
  });
});

describe("add", () => {
  it("saves every numbered episode of a long show and keeps the same row", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(showPayload(1101)), { status: 200 })
      )
    );
    const asUser = t.withIdentity({ subject: `${userId}|test-session` });

    const first = await asUser.action(api.shows.add, { tvmazeId: 1505 });
    const second = await asUser.action(api.shows.add, { tvmazeId: 1505 });

    const saved = await t.run(async (ctx) => {
      const myShow = await ctx.db.get(first.myShowId);
      const show = myShow === null ? null : await ctx.db.get(myShow.showId);
      const episodes = await ctx.db.query("episodes").collect();
      return { myShow, show, episodeCount: episodes.length };
    });

    expect(second.myShowId).toBe(first.myShowId);
    expect(saved.episodeCount).toBe(1101);
    expect(saved.show?.name).toBe("One Piece");
    expect(saved.show?.summary).toBe("Pirates.");
    expect(saved.myShow?.airedCount).toBe(1101);
    expect(saved.myShow?.nextEpisodeId).toBeDefined();
    expect(saved.myShow?.waitingAfterNext).toBe(1100);
  });
});

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

    const mine = await asUser.query(api.shows.get, { tvmazeId: 1505 });
    const missing = await asUser.query(api.shows.get, { tvmazeId: 999 });

    expect(mine?.yearSeasons).toBe(true);
    expect(mine?.seasons).toEqual([
      { number: 1999, episodeCount: 12, watchedCount: 0 },
      { number: 2026, episodeCount: 8, watchedCount: 0 },
    ]);
    expect(mine?.airedCount).toBe(20);
    expect(missing).toBeNull();
  });
});

describe("preview", () => {
  it("returns the details and saves nothing", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).endsWith("/seasons")) {
          return new Response(
            JSON.stringify([{ number: 1 }, { number: 2 }, { number: null }]),
            { status: 200 }
          );
        }
        return new Response(
          JSON.stringify({
            id: 44702,
            name: "One Piece",
            genres: ["Action", "Adventure"],
            status: "Running",
            rating: { average: 8.7 },
            network: { name: "Netflix" },
            summary: "<p>Pirates.</p>",
            image: { original: "https://img.example/poster.jpg" },
          }),
          { status: 200 }
        );
      })
    );
    const asUser = t.withIdentity({ subject: `${userId}|test-session` });

    const details = await asUser.action(api.shows.preview, { tvmazeId: 44702 });
    const saved = await t.run(async (ctx) => ctx.db.query("shows").collect());

    expect(details.seasonCount).toBe(2);
    expect(details.rating).toBe(8.7);
    expect(details.summary).toBe("Pirates.");
    expect(details.network).toBe("Netflix");
    expect(saved).toHaveLength(0);
  });
});
