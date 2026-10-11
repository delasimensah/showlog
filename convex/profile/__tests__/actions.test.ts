/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "../../_generated/api";
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
  "profile"
);

describe("exportHistory", () => {
  it("returns the shows and watched episodes as text", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "The Bear",
        genres: ["Drama"],
        status: "Running",
        seasons: [],
        yearSeasons: false,
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
        airsAt: 1,
      });
      await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: 1_700_000_000_000,
        watchLater: false,
        airedCount: 2,
        watchedCount: 1,
        waitingAfterNext: 0,
      });
      await ctx.db.insert("watchedEpisodes", {
        userId,
        showId,
        episodeId,
        season: 1,
        watchedAt: 50,
        minutes: 40,
      });
      return userId;
    });

    const history = JSON.parse(
      await t
        .withIdentity({ subject: `${userId}|test-session` })
        .action(api.profile.actions.exportHistory, {})
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
        watchedAt: 50,
      },
    ]);
  });
});
