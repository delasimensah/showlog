import { v } from "convex/values";

import { authedQuery } from "../lib/functions";

export const account = authedQuery({
  args: {},
  returns: v.object({
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const user = await ctx.db.get(ctx.userId);
    return {
      name: user?.name ?? null,
      email: user?.email ?? null,
    };
  },
});

export const stats = authedQuery({
  args: {},
  returns: v.object({
    episodesWatched: v.number(),
    minutesWatched: v.number(),
  }),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .unique();
    return {
      episodesWatched: row?.episodesWatched ?? 0,
      minutesWatched: row?.minutesWatched ?? 0,
    };
  },
});
