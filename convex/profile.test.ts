/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
]);

describe("account", () => {
  it("returns the signed-in user's name and email", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Ada",
        email: "me@example.com",
      });
    });

    const account = await t
      .withIdentity({ subject: `${userId}|test-session` })
      .query(api.profile.account, {});

    expect(account).toEqual({ name: "Ada", email: "me@example.com" });
  });
});
