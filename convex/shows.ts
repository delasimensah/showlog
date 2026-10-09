import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { authedQuery } from "./lib/functions";
import { ERROR_CODES, raise } from "./lib/errors";
import { recomputeProgress } from "./progress";
import {
  SHOW_STATUSES,
  copiesFromShowPayload,
  countNumberedSeasons,
  fetchJson,
  toShowCopy,
  type EpisodeCopy,
  type ShowCopy,
} from "./tvmaze";

export const EPISODE_BATCH_SIZE = 500;

export function chunkEpisodes<T>(
  episodes: T[],
  size = EPISODE_BATCH_SIZE
): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < episodes.length; index += size) {
    batches.push(episodes.slice(index, index + size));
  }
  return batches;
}

const showStatus = v.union(
  v.literal("Running"),
  v.literal("Ended"),
  v.literal("To Be Determined"),
  v.literal("In Development")
);

const seasonSummary = v.object({
  number: v.number(),
  episodeCount: v.number(),
  firstOrder: v.number(),
});

const showFields = {
  tvmazeId: v.number(),
  name: v.string(),
  type: v.optional(v.string()),
  language: v.optional(v.string()),
  genres: v.array(v.string()),
  status: showStatus,
  network: v.optional(v.string()),
  networkTimeZone: v.optional(v.string()),
  premiered: v.optional(v.string()),
  averageRuntime: v.optional(v.number()),
  rating: v.optional(v.number()),
  summary: v.optional(v.string()),
  posterUrl: v.optional(v.string()),
  headerUrl: v.optional(v.string()),
  seasons: v.array(seasonSummary),
  yearSeasons: v.boolean(),
  tvmazeUpdatedAt: v.number(),
};

const episodeFields = {
  tvmazeId: v.number(),
  season: v.number(),
  number: v.number(),
  order: v.number(),
  name: v.string(),
  summary: v.optional(v.string()),
  runtime: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  airsAt: v.optional(v.number()),
  airTimeKnown: v.boolean(),
};

export const myShowForTvmaze = internalQuery({
  args: { userId: v.id("users"), tvmazeId: v.number() },
  returns: v.union(v.id("myShows"), v.null()),
  handler: async (ctx, args) => {
    const show = await ctx.db
      .query("shows")
      .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", args.tvmazeId))
      .unique();
    if (show === null) return null;
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", args.userId).eq("showId", show._id)
      )
      .unique();
    return mine?._id ?? null;
  },
});

export const insertShow = internalMutation({
  args: showFields,
  returns: v.id("shows"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shows")
      .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", args.tvmazeId))
      .unique();
    if (existing !== null) return existing._id;
    return await ctx.db.insert("shows", args);
  },
});

export const insertEpisodeBatch = internalMutation({
  args: {
    showId: v.id("shows"),
    episodes: v.array(v.object(episodeFields)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const episode of args.episodes) {
      const existing = await ctx.db
        .query("episodes")
        .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", episode.tvmazeId))
        .unique();
      if (existing !== null) continue;
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

function showArgs(show: ShowCopy) {
  if (!SHOW_STATUSES.some((status) => status === show.status)) {
    throw new Error("TVmaze did not return this show");
  }
  return show;
}

function episodeArgs(episode: EpisodeCopy) {
  return episode;
}

export const add = action({
  args: { tvmazeId: v.number() },
  returns: v.object({ myShowId: v.id("myShows") }),
  handler: async (ctx, args): Promise<{ myShowId: Id<"myShows"> }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) raise(ERROR_CODES.UNAUTHENTICATED);

    const existing: Id<"myShows"> | null = await ctx.runQuery(
      internal.shows.myShowForTvmaze,
      { userId, tvmazeId: args.tvmazeId }
    );
    if (existing !== null) return { myShowId: existing };

    const payload = await fetchJson(
      `/shows/${args.tvmazeId}?embed[]=episodes&embed[]=images`
    );
    const { show, episodes } = copiesFromShowPayload(payload);
    if (show.tvmazeId !== args.tvmazeId) {
      throw new Error("TVmaze returned a different show");
    }

    const showId: Id<"shows"> = await ctx.runMutation(
      internal.shows.insertShow,
      showArgs(show)
    );
    for (const batch of chunkEpisodes(episodes)) {
      await ctx.runMutation(internal.shows.insertEpisodeBatch, {
        showId,
        episodes: batch.map(episodeArgs),
      });
    }
    const myShowId: Id<"myShows"> = await ctx.runMutation(
      internal.shows.attachMyShow,
      { userId, showId }
    );
    return { myShowId };
  },
});

const seasonRow = v.object({
  number: v.number(),
  episodeCount: v.number(),
  watchedCount: v.number(),
});

export const get = authedQuery({
  args: { tvmazeId: v.number() },
  returns: v.union(
    v.object({
      tvmazeId: v.number(),
      name: v.string(),
      headerUrl: v.union(v.string(), v.null()),
      posterUrl: v.union(v.string(), v.null()),
      network: v.union(v.string(), v.null()),
      summary: v.union(v.string(), v.null()),
      genres: v.array(v.string()),
      yearSeasons: v.boolean(),
      seasons: v.array(seasonRow),
      watchedCount: v.number(),
      airedCount: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const show = await ctx.db
      .query("shows")
      .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", args.tvmazeId))
      .unique();
    if (show === null) return null;
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", ctx.userId).eq("showId", show._id)
      )
      .unique();
    if (mine === null) return null;

    const ticks = await ctx.db
      .query("watchedEpisodes")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", ctx.userId).eq("showId", show._id)
      )
      .collect();
    const watchedBySeason = new Map<number, number>();
    for (const tick of ticks) {
      watchedBySeason.set(
        tick.season,
        (watchedBySeason.get(tick.season) ?? 0) + 1
      );
    }

    return {
      tvmazeId: show.tvmazeId,
      name: show.name,
      headerUrl: show.headerUrl ?? null,
      posterUrl: show.posterUrl ?? null,
      network: show.network ?? null,
      summary: show.summary ?? null,
      genres: show.genres,
      yearSeasons: show.yearSeasons,
      seasons: show.seasons.map((season) => ({
        number: season.number,
        episodeCount: season.episodeCount,
        watchedCount: watchedBySeason.get(season.number) ?? 0,
      })),
      watchedCount: mine.watchedCount,
      airedCount: mine.airedCount,
    };
  },
});

export const preview = action({
  args: { tvmazeId: v.number() },
  returns: v.object({
    tvmazeId: v.number(),
    name: v.string(),
    genres: v.array(v.string()),
    status: showStatus,
    seasonCount: v.number(),
    summary: v.union(v.string(), v.null()),
    headerUrl: v.union(v.string(), v.null()),
    posterUrl: v.union(v.string(), v.null()),
    network: v.union(v.string(), v.null()),
    rating: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) raise(ERROR_CODES.UNAUTHENTICATED);

    const payload = await fetchJson(`/shows/${args.tvmazeId}?embed[]=images`);
    const seasons = await fetchJson(`/shows/${args.tvmazeId}/seasons`);
    const show = toShowCopy(payload, []);
    if (show.tvmazeId !== args.tvmazeId) {
      throw new Error("TVmaze returned a different show");
    }

    return {
      tvmazeId: show.tvmazeId,
      name: show.name,
      genres: show.genres,
      status: show.status,
      seasonCount: countNumberedSeasons(seasons),
      summary: show.summary ?? null,
      headerUrl: show.headerUrl ?? null,
      posterUrl: show.posterUrl ?? null,
      network: show.network ?? null,
      rating: show.rating ?? null,
    };
  },
});
