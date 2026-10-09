import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { recomputeProgress } from "./progress";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Steps 1 and 2 of the hourly clock. Alerts are added in a later ticket.
 * An episode that aired in the last hour becomes the next episode for anyone
 * who has that show, without waiting for a tick.
 */
export const hourly = internalMutation({
  args: { now: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const aired = await ctx.db
      .query("episodes")
      .withIndex("by_airsAt", (q) =>
        q.gte("airsAt", now - HOUR_MS).lte("airsAt", now)
      )
      .collect();

    const showIds = new Set<Id<"shows">>();
    for (const episode of aired) showIds.add(episode.showId);

    for (const showId of showIds) {
      const rows = await ctx.db
        .query("myShows")
        .withIndex("by_show", (q) => q.eq("showId", showId))
        .collect();
      for (const row of rows) {
        await recomputeProgress(ctx, row._id, now);
      }
    }
    return null;
  },
});
