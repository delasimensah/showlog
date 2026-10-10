/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { isAnimeShow, toPoolShows } from "./discover";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: `${userId}|test-session` });
}

async function discoverRows(
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">
) {
  const user = asUser(t, userId);
  const taste = await user.query(api.discover.taste, {});
  return await user.query(api.discover.rows, taste);
}

describe("isAnimeShow", () => {
  it("counts the Anime genre and Japanese animation", () => {
    expect(isAnimeShow({ genres: ["Drama", "Anime"], type: "Scripted" })).toBe(
      true
    );
    expect(
      isAnimeShow({
        genres: ["Action"],
        type: "Animation",
        language: "Japanese",
      })
    ).toBe(true);
    expect(
      isAnimeShow({
        genres: ["Comedy"],
        type: "Animation",
        language: "English",
      })
    ).toBe(false);
  });
});

describe("toPoolShows", () => {
  it("keeps popular shows that have a poster", () => {
    const shows = toPoolShows(
      [
        {
          id: 1,
          name: "Kept",
          weight: 85,
          image: { original: "https://img.example/kept.jpg" },
          genres: ["Anime"],
          status: "Running",
          rating: { average: 9 },
        },
        {
          id: 2,
          name: "Unpopular",
          weight: 84,
          image: { original: "https://img.example/no.jpg" },
          genres: [],
          status: "Running",
        },
        {
          id: 3,
          name: "No poster",
          weight: 90,
          genres: [],
          status: "Ended",
        },
      ],
      10
    );

    expect(shows.map((show) => show.name)).toEqual(["Kept"]);
    expect(shows[0]?.isAnime).toBe(true);
    expect(shows[0]?.posterUrl).toBe("https://img.example/kept.jpg");
  });
});

describe("rows", () => {
  it("suggests anime, what is running, and the top rated before I add a show", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 2,
        name: "Anime hit",
        posterUrl: "https://img.example/anime.jpg",
        genres: ["Anime"],
        status: "Running",
        rating: 9,
        weight: 90,
        isAnime: true,
        refreshId: 1,
      });
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 3,
        name: "Ended classic",
        posterUrl: "https://img.example/ended.jpg",
        genres: ["Drama"],
        status: "Ended",
        rating: 8.5,
        weight: 88,
        isAnime: false,
        refreshId: 1,
      });
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 4,
        name: "Running okay",
        posterUrl: "https://img.example/ok.jpg",
        genres: ["Comedy"],
        status: "Running",
        rating: 7,
        weight: 86,
        isAnime: false,
        refreshId: 1,
      });
      return userId;
    });

    const rows = await discoverRows(t, userId);

    expect(rows.map((row) => row.title)).toEqual([
      "Popular anime",
      "Popular right now",
      "Top rated",
    ]);
    expect(rows[0]?.shows.map((show) => show.name)).toEqual(["Anime hit"]);
    expect(rows[1]?.shows.map((show) => show.name)).toEqual([
      "Anime hit",
      "Running okay",
    ]);
    expect(rows[2]?.shows.map((show) => show.name)).toEqual([
      "Anime hit",
      "Ended classic",
    ]);
  });

  it("follows the genres on my list and leaves those shows out", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "Mine",
        genres: ["Drama", "Anime"],
        type: "Animation",
        language: "Japanese",
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      await ctx.db.insert("shows", {
        tvmazeId: 5,
        name: "Also mine",
        genres: ["Drama"],
        status: "Ended",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      const otherId = await ctx.db
        .query("shows")
        .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", 5))
        .unique();
      if (otherId === null) throw new Error("missing show");
      await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: 1,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      await ctx.db.insert("myShows", {
        userId,
        showId: otherId._id,
        addedAt: 2,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 1,
        name: "Mine",
        posterUrl: "https://img.example/mine.jpg",
        genres: ["Drama", "Anime"],
        status: "Running",
        rating: 9.5,
        weight: 95,
        isAnime: true,
        refreshId: 1,
      });
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 2,
        name: "More drama",
        posterUrl: "https://img.example/drama.jpg",
        genres: ["Drama"],
        status: "Ended",
        rating: 8.2,
        weight: 90,
        isAnime: false,
        refreshId: 1,
      });
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 3,
        name: "More anime",
        posterUrl: "https://img.example/anime.jpg",
        genres: ["Anime"],
        type: "Animation",
        language: "Japanese",
        status: "Running",
        rating: 8.8,
        weight: 91,
        isAnime: true,
        refreshId: 1,
      });
      return userId;
    });

    const rows = await discoverRows(t, userId);

    expect(rows.map((row) => row.title)).toEqual([
      "Because you watch anime",
      "More Drama",
      "More Anime",
      "Top rated",
    ]);
    expect(rows[0]?.shows.map((show) => show.name)).toEqual(["More anime"]);
    expect(rows[1]?.shows.map((show) => show.name)).toEqual(["More drama"]);
    expect(
      rows.every((row) => row.shows.every((show) => show.name !== "Mine"))
    ).toBe(true);

    const taste = await asUser(t, userId).query(api.discover.taste, {});
    expect(taste).toEqual({
      listed: [1, 5],
      genres: ["Drama", "Anime"],
      watchesAnime: true,
    });
  });
});
