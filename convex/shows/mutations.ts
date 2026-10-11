import { v } from "convex/values";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { ERROR_CODES, raise } from "../lib/errors";
import { authedMutation } from "../lib/functions";
import { recomputeProgress } from "../lib/progress";
import {
  EPISODE_BATCH_SIZE,
  episodeFields,
  showFields,
} from "../lib/showModel";

async function requireOwned(
  ctx: MutationCtx & { userId: Id<"users"> },
  myShowId: Id<"myShows">
) {
  const mine = await ctx.db.get(myShowId);
  if (mine === null || mine.userId !== ctx.userId) {
    raise(ERROR_CODES.NOT_PERMITTED);
  }
  return mine;
}

async function subtractStats(
  ctx: MutationCtx,
  userId: Id<"users">,
  episodes: number,
  minutes: number
) {
  const stats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (stats === null) return;
  await ctx.db.patch(stats._id, {
    episodesWatched: Math.max(0, stats.episodesWatched - episodes),
    minutesWatched: Math.max(0, stats.minutesWatched - minutes),
  });
}

export const insertShow = internalMutation({
  args: showFields,
  returns: v.object({ showId: v.id("shows"), created: v.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shows")
      .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", args.tvmazeId))
      .unique();
    if (existing !== null) return { showId: existing._id, created: false };
    return { showId: await ctx.db.insert("shows", args), created: true };
  },
});

export const insertEpisodeBatch = internalMutation({
  args: {
    showId: v.id("shows"),
    episodes: v.array(v.object(episodeFields)),
    skipDuplicateCheck: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const episode of args.episodes) {
      if (!args.skipDuplicateCheck) {
        const existing = await ctx.db
          .query("episodes")
          .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", episode.tvmazeId))
          .unique();
        if (existing !== null) continue;
      }
      await ctx.db.insert("episodes", { ...episode, showId: args.showId });
    }
    return null;
  },
});

export const attachMyShow = internalMutation({
  args: { userId: v.id("users"), showId: v.id("shows") },
  returns: v.id("myShows"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("myShows")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", args.userId).eq("showId", args.showId)
      )
      .unique();
    const myShowId =
      existing?._id ??
      (await ctx.db.insert("myShows", {
        userId: args.userId,
        showId: args.showId,
        addedAt: Date.now(),
        watchLater: false,
        airedCount: 0,
        watchedCount: 0,
        waitingAfterNext: 0,
      }));
    await recomputeProgress(ctx, myShowId, Date.now());
    return myShowId;
  },
});

export const setWatchLater = authedMutation({
  args: { myShowId: v.id("myShows"), on: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mine = await requireOwned(ctx, args.myShowId);
    if (mine.watchLater !== args.on) {
      await ctx.db.patch(mine._id, { watchLater: args.on });
    }
    return null;
  },
});

export const stop = authedMutation({
  args: { myShowId: v.id("myShows") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mine = await requireOwned(ctx, args.myShowId);
    if (mine.stoppedAt === undefined) {
      await ctx.db.patch(mine._id, { stoppedAt: Date.now() });
    }
    return null;
  },
});

export const resume = authedMutation({
  args: { myShowId: v.id("myShows") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mine = await requireOwned(ctx, args.myShowId);
    if (mine.stoppedAt !== undefined) {
      const { _id, _creationTime, stoppedAt: _stopped, ...rest } = mine;
      await ctx.db.replace(_id, rest);
    }
    return null;
  },
});

export const remove = authedMutation({
  args: { myShowId: v.id("myShows") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mine = await requireOwned(ctx, args.myShowId);
    const ticks = await ctx.db
      .query("watchedEpisodes")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", ctx.userId).eq("showId", mine.showId)
      )
      .collect();
    let minutes = 0;
    for (const tick of ticks) {
      minutes += tick.minutes;
      await ctx.db.delete(tick._id);
    }
    await subtractStats(ctx, ctx.userId, ticks.length, minutes);
    const showId = mine.showId;
    await ctx.db.delete(mine._id);
    await ctx.scheduler.runAfter(0, internal.shows.mutations.deleteShowCopy, {
      showId,
    });
    return null;
  },
});

/**
 * A long show can have over a thousand episodes, so the copy is deleted in
 * batches. Another person's list row keeps the copy.
 */
export const deleteShowCopy = internalMutation({
  args: { showId: v.id("shows") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stillListed = await ctx.db
      .query("myShows")
      .withIndex("by_show", (q) => q.eq("showId", args.showId))
      .take(1);
    if (stillListed.length > 0) return null;

    const episodes = await ctx.db
      .query("episodes")
      .withIndex("by_show_order", (q) => q.eq("showId", args.showId))
      .take(EPISODE_BATCH_SIZE);
    for (const episode of episodes) {
      await ctx.db.delete(episode._id);
    }
    if (episodes.length === EPISODE_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.shows.mutations.deleteShowCopy, {
        showId: args.showId,
      });
      return null;
    }
    await ctx.db.delete(args.showId);
    return null;
  },
});
