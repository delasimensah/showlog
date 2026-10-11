import { v } from "convex/values";

import { internalQuery } from "../_generated/server";

export const listedTvmazeIds = internalQuery({
  args: {
    userId: v.id("users"),
    tvmazeIds: v.array(v.number()),
  },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    const listed: number[] = [];
    for (const tvmazeId of args.tvmazeIds) {
      const show = await ctx.db
        .query("shows")
        .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", tvmazeId))
        .unique();
      if (show === null) continue;
      const mine = await ctx.db
        .query("myShows")
        .withIndex("by_user_show", (q) =>
          q.eq("userId", args.userId).eq("showId", show._id)
        )
        .unique();
      if (mine !== null) listed.push(tvmazeId);
    }
    return listed;
  },
});
