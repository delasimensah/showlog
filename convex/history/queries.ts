import { v } from "convex/values";
import { showStatus } from "shared";

import { internalQuery } from "../_generated/server";

const PAGE_SIZE = 100;

const historyShow = v.object({
  name: v.string(),
  addedAt: v.number(),
  status: v.string(),
});

const historyEpisode = v.object({
  show: v.string(),
  season: v.number(),
  number: v.number(),
  title: v.string(),
  watchedAt: v.number(),
});

export const showsPage = internalQuery({
  args: {
    userId: v.id("users"),
    cursor: v.union(v.string(), v.null()),
  },
  returns: v.object({
    page: v.array(historyShow),
    continueCursor: v.string(),
    isDone: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("myShows")
      .withIndex("by_user_addedAt", (q) => q.eq("userId", args.userId))
      .paginate({ numItems: PAGE_SIZE, cursor: args.cursor });
    const page = [];
    for (const mine of result.page) {
      const show = await ctx.db.get(mine.showId);
      if (show === null) continue;
      page.push({
        name: show.name,
        addedAt: mine.addedAt,
        status: showStatus({
          watchedCount: mine.watchedCount,
          airedCount: mine.airedCount,
          watchLater: mine.watchLater,
          stopped: mine.stoppedAt !== undefined,
          tvmazeStatus: show.status,
        }),
      });
    }
    return {
      page,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

export const episodesPage = internalQuery({
  args: {
    userId: v.id("users"),
    cursor: v.union(v.string(), v.null()),
  },
  returns: v.object({
    page: v.array(historyEpisode),
    continueCursor: v.string(),
    isDone: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("watchedEpisodes")
      .withIndex("by_user_show", (q) => q.eq("userId", args.userId))
      .paginate({ numItems: PAGE_SIZE, cursor: args.cursor });
    const page = [];
    for (const tick of result.page) {
      const show = await ctx.db.get(tick.showId);
      const episode = await ctx.db.get(tick.episodeId);
      if (show === null || episode === null) continue;
      page.push({
        show: show.name,
        season: tick.season,
        number: episode.number,
        title: episode.name,
        watchedAt: tick.watchedAt,
      });
    }
    return {
      page,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});
