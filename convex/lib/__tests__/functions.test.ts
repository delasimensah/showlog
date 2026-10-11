/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
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
  "lib"
);

describe("authedQuery and authedMutation", () => {
  it("rejects a caller who is not signed in", async () => {
    const t = convexTest(schema, modules);
    const myShowId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "The Bear",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      return await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: 1,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
    });

    await expect(
      t.query(api.profile.queries.account, {})
    ).rejects.toBeInstanceOf(ConvexError);
    await expect(
      t.mutation(api.shows.mutations.setWatchLater, { myShowId, on: true })
    ).rejects.toBeInstanceOf(ConvexError);
  });
});
