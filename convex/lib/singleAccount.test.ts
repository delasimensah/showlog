import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import schema from "../schema";
import {
  ACCOUNT_TAKEN_MESSAGE,
  createOrUpdateShowlogUser,
} from "./singleAccount";

describe("createOrUpdateShowlogUser", () => {
  it("creates the first account and refuses a second one", async () => {
    const t = convexTest(schema);

    const firstId = await t.run(async (ctx) => {
      return await createOrUpdateShowlogUser(ctx, {
        existingUserId: null,
        email: "first@example.com",
        name: "Ada",
      });
    });

    await expect(
      t.run(async (ctx) => {
        return await createOrUpdateShowlogUser(ctx, {
          existingUserId: null,
          email: "second@example.com",
          name: "Bea",
        });
      })
    ).rejects.toThrow(ACCOUNT_TAKEN_MESSAGE);

    const accounts = await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      return users.map((user) => ({ email: user.email, name: user.name }));
    });

    expect(firstId).toBeTruthy();
    expect(accounts).toEqual([{ email: "first@example.com", name: "Ada" }]);
  });

  it("returns the existing user when they are already signing in", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "me@example.com" });
    });

    const returnedId = await t.run(async (ctx) => {
      return await createOrUpdateShowlogUser(ctx, {
        existingUserId: userId,
        email: "other@example.com",
        name: "Other",
      });
    });

    expect(returnedId).toBe(userId);
  });
});
