import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { internalQuery } from "../_generated/server";

export const showsToRefresh = internalQuery({
  args: { tvmazeIds: v.array(v.number()) },
  returns: v.array(
    v.object({
      showId: v.id("shows"),
      tvmazeId: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const shows: Array<{ showId: Id<"shows">; tvmazeId: number }> = [];
    for (const tvmazeId of args.tvmazeIds) {
      const show = await ctx.db
        .query("shows")
        .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", tvmazeId))
        .unique();
      if (show !== null) shows.push({ showId: show._id, tvmazeId });
    }
    return shows;
  },
});
