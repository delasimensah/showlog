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
  "search"
);

describe("listedTvmazeIds", () => {
  it("returns only the ids that are on this person's list", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { name: "Ada" });
      const listedId = await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "The Bear",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      await ctx.db.insert("shows", {
        tvmazeId: 2,
        name: "Not mine",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      await ctx.db.insert("myShows", {
        userId,
        showId: listedId,
        addedAt: 1,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
      return userId;
    });

    const listed = await t.query(internal.search.queries.listedTvmazeIds, {
      userId,
      tvmazeIds: [1, 2, 999],
    });

    expect(listed).toEqual([1]);
  });
});
