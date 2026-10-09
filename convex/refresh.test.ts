/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

afterEach(() => {
  vi.unstubAllGlobals();
});

function refreshedShow() {
  return {
    id: 1,
    name: "New name",
    status: "Running",
    genres: ["Drama"],
    updated: 1_800_000_000,
    _embedded: {
      episodes: [
        {
          id: 11,
          name: "New pilot",
          season: 1,
          number: 1,
          type: "regular",
          airstamp: "2020-01-01T00:00:00.000Z",
          runtime: 40,
        },
        {
          id: 13,
          name: "Added",
          season: 1,
          number: 2,
          type: "regular",
          airstamp: "2020-01-08T00:00:00.000Z",
          runtime: 40,
        },
      ],
    },
  };
}

describe("daily", () => {
  it("updates a changed show and leaves the others alone", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
      const changedId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "Old name",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      const quietId = await ctx.db.insert("shows", {
        tvmazeId: 2,
        name: "Quiet",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      const pilot = await ctx.db.insert("episodes", {
        showId: changedId,
        tvmazeId: 11,
        season: 1,
        number: 1,
        order: 1,
        name: "Pilot",
        airTimeKnown: true,
        airsAt: Date.parse("2020-01-01T00:00:00.000Z"),
      });
      const gone = await ctx.db.insert("episodes", {
        showId: changedId,
        tvmazeId: 12,
        season: 1,
        number: 2,
        order: 2,
        name: "Gone",
        airTimeKnown: true,
        airsAt: Date.parse("2020-01-02T00:00:00.000Z"),
        runtime: 40,
      });
      await ctx.db.insert("episodes", {
        showId: quietId,
        tvmazeId: 21,
        season: 1,
        number: 1,
        order: 1,
        name: "Stays",
        airTimeKnown: true,
        airsAt: Date.parse("2020-01-01T00:00:00.000Z"),
      });
      await ctx.db.insert("watchedEpisodes", {
        userId,
        showId: changedId,
        episodeId: gone,
        season: 1,
        watchedAt: 1,
        minutes: 40,
      });
      await ctx.db.insert("userStats", {
        userId,
        episodesWatched: 1,
        minutesWatched: 40,
      });
      const changedList = await ctx.db.insert("myShows", {
        userId,
        showId: changedId,
        addedAt: 1,
        watchLater: false,
        airedCount: 2,
        watchedCount: 1,
        waitingAfterNext: 0,
      });
      const quietList = await ctx.db.insert("myShows", {
        userId,
        showId: quietId,
        addedAt: 1,
        watchLater: false,
        airedCount: 7,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      return { pilot, gone, changedList, quietList, quietId };
    });

    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.endsWith("/updates/shows?since=day")) {
        return new Response(JSON.stringify({ "1": 1_800_000_000, "999": 1 }), {
          status: 200,
        });
      }
      if (url.includes("/shows/1?")) {
        return new Response(JSON.stringify(refreshedShow()), { status: 200 });
      }
      throw new Error(`Unexpected TVmaze call ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await t.action(internal.refresh.daily, {});

    const saved = await t.run(async (ctx) => {
      const changed = await ctx.db.get(seeded.changedList);
      const show = changed === null ? null : await ctx.db.get(changed.showId);
      const episodes = await ctx.db.query("episodes").collect();
      const ticks = await ctx.db.query("watchedEpisodes").collect();
      const stats = await ctx.db.query("userStats").collect();
      const quiet = await ctx.db.get(seeded.quietList);
      const quietShow = await ctx.db.get(seeded.quietId);
      return { changed, show, episodes, ticks, stats, quiet, quietShow };
    });

    expect(saved.show?.name).toBe("New name");
    expect(saved.episodes.map((episode) => episode.name).sort()).toEqual([
      "Added",
      "New pilot",
      "Stays",
    ]);
    expect(saved.episodes.find((episode) => episode.tvmazeId === 11)?._id).toBe(
      seeded.pilot
    );
    expect(saved.ticks).toHaveLength(0);
    expect(saved.stats[0]?.episodesWatched).toBe(0);
    expect(saved.stats[0]?.minutesWatched).toBe(0);
    expect(saved.changed?.watchedCount).toBe(0);
    expect(saved.changed?.airedCount).toBe(2);
    expect(saved.quietShow?.name).toBe("Quiet");
    expect(saved.quiet?.airedCount).toBe(7);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
