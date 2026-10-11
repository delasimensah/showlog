/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("refreshPool", () => {
  it("saves one page and drops the previous refresh when the next page is missing", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("suggestedShows", {
        tvmazeId: 1,
        name: "Old",
        posterUrl: "https://img.example/old.jpg",
        genres: ["Drama"],
        status: "Running",
        weight: 90,
        isAnime: false,
        refreshId: 1,
      });
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.endsWith("/shows?page=0")) {
          return new Response(
            JSON.stringify([
              {
                id: 82,
                name: "Slow Horses",
                weight: 90,
                status: "Running",
                genres: ["Drama"],
                image: { original: "https://img.example/slow.jpg" },
              },
            ]),
            { status: 200 }
          );
        }
        if (url.endsWith("/shows?page=1")) {
          return new Response("missing", { status: 404 });
        }
        throw new Error(`Unexpected TVmaze call ${url}`);
      })
    );

    await t.action(internal.discover.actions.refreshPool, {
      page: 0,
      refreshId: 2,
    });

    const saved = await t.run(async (ctx) =>
      ctx.db.query("suggestedShows").collect()
    );
    expect(saved.map((show) => show.name)).toEqual(["Slow Horses"]);
    expect(saved[0]?.refreshId).toBe(2);
  });
});
