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

describe("apply", () => {
  it("refuses a catalog for a different show", async () => {
    const t = convexTest(schema, modules);
    const showId = await t.run(async (ctx) => {
      return await ctx.db.insert("shows", {
        tvmazeId: 1,
        name: "Old name",
        genres: [],
        status: "Running",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
    });

    await expect(
      t.mutation(internal.refresh.mutations.apply, {
        showId,
        show: {
          tvmazeId: 99,
          name: "Someone else",
          genres: [],
          status: "Running",
          seasons: [],
          yearSeasons: false,
          tvmazeUpdatedAt: 1,
        },
        episodes: [],
      })
    ).rejects.toThrow("TVmaze returned a different show");
  });
});
