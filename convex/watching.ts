import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedMutation } from "./lib/functions";
import {
  hasAired,
  recomputeProgress,
  tickProgress,
  untickProgress,
} from "./progress";

function minutesFor(episode: Doc<"episodes">, show: Doc<"shows">) {
  if (episode.runtime !== undefined && episode.runtime > 0) {
    return episode.runtime;
  }
  if (show.averageRuntime !== undefined && show.averageRuntime > 0) {
    return show.averageRuntime;
  }
  return 0;
}

async function requireMine(
  ctx: MutationCtx & { userId: Id<"users"> },
  showId: Id<"shows">
) {
  const show = await ctx.db.get(showId);
  if (show === null) raise(ERROR_CODES.INVALID, "Show not found");
  const mine = await ctx.db
    .query("myShows")
    .withIndex("by_user_show", (q) =>
      q.eq("userId", ctx.userId).eq("showId", showId)
    )
    .unique();
  if (mine === null) raise(ERROR_CODES.NOT_PERMITTED);
  return { show, mine };
}

async function changeStats(
  ctx: MutationCtx,
  userId: Id<"users">,
  episodes: number,
  minutes: number
) {
  const stats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (stats === null) {
    await ctx.db.insert("userStats", {
      userId,
      episodesWatched: Math.max(0, episodes),
      minutesWatched: Math.max(0, minutes),
    });
    return;
  }
  await ctx.db.patch(stats._id, {
    episodesWatched: Math.max(0, stats.episodesWatched + episodes),
    minutesWatched: Math.max(0, stats.minutesWatched + minutes),
  });
}

async function existingTick(
  ctx: MutationCtx,
  userId: Id<"users">,
  episodeId: Id<"episodes">
) {
  return await ctx.db
    .query("watchedEpisodes")
    .withIndex("by_user_episode", (q) =>
      q.eq("userId", userId).eq("episodeId", episodeId)
    )
    .unique();
}

async function saveTick(
  ctx: MutationCtx & { userId: Id<"users"> },
  episode: Doc<"episodes">,
  show: Doc<"shows">,
  watchedAt: number
) {
  const already = await existingTick(ctx, ctx.userId, episode._id);
  if (already !== null) return false;
  await ctx.db.insert("watchedEpisodes", {
    userId: ctx.userId,
    showId: episode.showId,
    episodeId: episode._id,
    season: episode.season,
    watchedAt,
    minutes: minutesFor(episode, show),
  });
  return true;
}

export const tick = authedMutation({
  args: { episodeId: v.id("episodes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (episode === null) raise(ERROR_CODES.INVALID, "Episode not found");
    const now = Date.now();
    if (!hasAired(episode, now)) {
      raise(ERROR_CODES.INVALID, "This episode has not aired.");
    }
    const { show, mine } = await requireMine(ctx, episode.showId);
    const saved = await saveTick(ctx, episode, show, now);
    if (saved) {
      await changeStats(ctx, ctx.userId, 1, minutesFor(episode, show));
    }
    if (mine.watchLater) {
      await ctx.db.patch(mine._id, { watchLater: false });
    }
    if (saved) await tickProgress(ctx, mine, episode, now, now);
    return null;
  },
});

export const untick = authedMutation({
  args: { episodeId: v.id("episodes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (episode === null) raise(ERROR_CODES.INVALID, "Episode not found");
    const { mine } = await requireMine(ctx, episode.showId);
    const tickRow = await existingTick(ctx, ctx.userId, episode._id);
    if (tickRow !== null) {
      await ctx.db.delete(tickRow._id);
      await changeStats(ctx, ctx.userId, -1, -tickRow.minutes);
      await untickProgress(ctx, mine, episode, Date.now());
    }
    return null;
  },
});

export const watchSeason = authedMutation({
  args: { showId: v.id("shows"), season: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { show, mine } = await requireMine(ctx, args.showId);
    const now = Date.now();
    const episodes = await ctx.db
      .query("episodes")
      .withIndex("by_show_season", (q) =>
        q.eq("showId", args.showId).eq("season", args.season)
      )
      .collect();
    let added = 0;
    let minutes = 0;
    for (const episode of episodes) {
      if (!hasAired(episode, now)) continue;
      const saved = await saveTick(ctx, episode, show, now);
      if (!saved) continue;
      added += 1;
      minutes += minutesFor(episode, show);
    }
    if (added > 0) await changeStats(ctx, ctx.userId, added, minutes);
    if (mine.watchLater) {
      await ctx.db.patch(mine._id, { watchLater: false });
    }
    await recomputeProgress(ctx, mine._id, now);
    return null;
  },
});

export const watchUpTo = authedMutation({
  args: { episodeId: v.id("episodes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (episode === null) raise(ERROR_CODES.INVALID, "Episode not found");
    const now = Date.now();
    if (!hasAired(episode, now)) {
      raise(ERROR_CODES.INVALID, "This episode has not aired.");
    }
    const { show, mine } = await requireMine(ctx, episode.showId);
    const episodes = await ctx.db
      .query("episodes")
      .withIndex("by_show_order", (q) => q.eq("showId", episode.showId))
      .collect();
    let added = 0;
    let minutes = 0;
    for (const earlier of episodes) {
      if (earlier.order > episode.order || !hasAired(earlier, now)) continue;
      const saved = await saveTick(ctx, earlier, show, now);
      if (!saved) continue;
      added += 1;
      minutes += minutesFor(earlier, show);
    }
    if (added > 0) await changeStats(ctx, ctx.userId, added, minutes);
    if (mine.watchLater) {
      await ctx.db.patch(mine._id, { watchLater: false });
    }
    await recomputeProgress(ctx, mine._id, now);
    return null;
  },
});
