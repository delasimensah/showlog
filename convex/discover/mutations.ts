import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

const STALE_BATCH = 500;

const poolShow = v.object({
  tvmazeId: v.number(),
  name: v.string(),
  posterUrl: v.string(),
  genres: v.array(v.string()),
  type: v.optional(v.string()),
  language: v.optional(v.string()),
  premieredYear: v.optional(v.number()),
  status: v.union(
    v.literal("Running"),
    v.literal("Ended"),
    v.literal("To Be Determined"),
    v.literal("In Development")
  ),
  rating: v.optional(v.number()),
  network: v.optional(v.string()),
  weight: v.number(),
  isAnime: v.boolean(),
  refreshId: v.number(),
});

export const upsertSuggestions = internalMutation({
  args: { suggestions: v.array(poolShow) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const suggestion of args.suggestions) {
      const existing = await ctx.db
        .query("suggestedShows")
        .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", suggestion.tvmazeId))
        .unique();
      if (existing === null) {
        await ctx.db.insert("suggestedShows", suggestion);
      } else {
        await ctx.db.patch(existing._id, suggestion);
      }
    }
    return null;
  },
});

export const dropStale = internalMutation({
  args: { refreshId: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stale = await ctx.db
      .query("suggestedShows")
      .withIndex("by_refreshId", (q) => q.lt("refreshId", args.refreshId))
      .take(STALE_BATCH);
    for (const row of stale) await ctx.db.delete(row._id);
    if (stale.length === STALE_BATCH) {
      await ctx.scheduler.runAfter(0, internal.discover.mutations.dropStale, {
        refreshId: args.refreshId,
      });
    }
    return null;
  },
});
