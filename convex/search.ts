import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";
import { ERROR_CODES, raise } from "./lib/errors";
import { fetchJson, toSearchHits } from "./tvmaze";

const searchHit = v.object({
  tvmazeId: v.number(),
  name: v.string(),
  posterUrl: v.union(v.string(), v.null()),
  type: v.union(v.string(), v.null()),
  language: v.union(v.string(), v.null()),
  year: v.union(v.number(), v.null()),
  network: v.union(v.string(), v.null()),
  onList: v.boolean(),
});

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

export const searchShows = action({
  args: { query: v.string() },
  returns: v.array(searchHit),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) raise(ERROR_CODES.UNAUTHENTICATED);

    const query = args.query.trim();
    if (query.length < 2) return [];

    const payload = await fetchJson(
      `/search/shows?q=${encodeURIComponent(query)}`
    );
    const hits = toSearchHits(payload);
    const listed: number[] = await ctx.runQuery(
      internal.search.listedTvmazeIds,
      {
        userId,
        tvmazeIds: hits.map((hit) => hit.tvmazeId),
      }
    );
    const onList = new Set(listed);
    return hits.map((hit) => ({
      ...hit,
      onList: onList.has(hit.tvmazeId),
    }));
  },
});
