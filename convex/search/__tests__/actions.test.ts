/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  "search"
);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchShows", () => {
  it("marks a show that is already on the list", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });
    await t.run(async (ctx) => {
      const showId = await ctx.db.insert("shows", {
        tvmazeId: 169,
        name: "Breaking Bad",
        genres: ["Drama"],
        status: "Ended",
        seasons: [],
        yearSeasons: false,
        tvmazeUpdatedAt: 0,
      });
      await ctx.db.insert("myShows", {
        userId,
        showId,
        addedAt: 1,
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      });
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify([
            {
              score: 1,
              show: {
                id: 169,
                name: "Breaking Bad",
                type: "Scripted",
                language: "English",
                premiered: "2008-01-20",
                network: { name: "AMC" },
                image: { original: "https://img.example/bb.jpg" },
              },
            },
            {
              score: 0.4,
              show: {
                id: 530,
                name: "Breaking Bad",
                type: "Scripted",
                language: "English",
                premiered: "2008-01-20",
                network: { name: "Other" },
              },
            },
          ]),
          { status: 200 }
        );
      })
    );

    const hits = await t
      .withIdentity({ subject: `${userId}|test-session` })
      .action(api.search.actions.searchShows, { query: "brekaing bad" });

    expect(hits[0]).toMatchObject({
      tvmazeId: 169,
      name: "Breaking Bad",
      onList: true,
      year: 2008,
      network: "AMC",
    });
    expect(hits[1]?.onList).toBe(false);
  });
});
