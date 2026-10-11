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
  "refresh"
);

describe("showsToRefresh", () => {
  it("returns the stored show and skips an id we do not have", async () => {
    const t = convexTest(schema, modules);
    const showId = await t.run(async (ctx) => {
      return await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "The Bear",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
    });

    const shows = await t.query(internal.refresh.queries.showsToRefresh, {
      tvmazeIds: [1, 999],
    });

    expect(shows).toEqual([{ showId, tvmazeId: 1 }]);
  });
});
