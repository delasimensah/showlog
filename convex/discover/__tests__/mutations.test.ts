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
  "discover"
);

const slowHorses = {
  tvmazeId: 82,
  name: "Slow Horses",
  posterUrl: "https://img.example/slow.jpg",
  genres: ["Drama"],
  status: "Running" as const,
  weight: 90,
  isAnime: false,
  refreshId: 2,
};

describe("upsertSuggestions", () => {
  it("inserts a new suggestion and updates one that is already stored", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.discover.mutations.upsertSuggestions, {
      suggestions: [slowHorses],
    });
    await t.mutation(internal.discover.mutations.upsertSuggestions, {
      suggestions: [{ ...slowHorses, name: "Slow Horses (new)" }],
    });

    const saved = await t.run(async (ctx) =>
      ctx.db.query("suggestedShows").collect()
    );
    expect(saved).toHaveLength(1);
    expect(saved[0]?.name).toBe("Slow Horses (new)");
  });
});

describe("dropStale", () => {
  it("deletes suggestions from an older refresh", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("suggestedShows", {
        ...slowHorses,
        tvmazeId: 1,
        refreshId: 1,
      });
      await ctx.db.insert("suggestedShows", slowHorses);
    });

    await t.mutation(internal.discover.mutations.dropStale, { refreshId: 2 });

    const saved = await t.run(async (ctx) =>
      ctx.db.query("suggestedShows").collect()
    );
    expect(saved.map((show) => show.tvmazeId)).toEqual([82]);
  });
});
