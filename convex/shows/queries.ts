import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { internalQuery } from "../_generated/server";
import { ERROR_CODES, raise } from "../lib/errors";
import { authedQuery } from "../lib/functions";
import { hasAired } from "../lib/progress";

const seasonRow = v.object({
  number: v.number(),
  episodeCount: v.number(),
  watchedCount: v.number(),
});

const progressEpisode = v.object({
  episodeId: v.id("episodes"),
  season: v.number(),
  number: v.number(),
  order: v.number(),
  name: v.string(),
  summary: v.union(v.string(), v.null()),
  runtime: v.union(v.number(), v.null()),
  imageUrl: v.union(v.string(), v.null()),
  airsAt: v.union(v.number(), v.null()),
  airTimeKnown: v.boolean(),
});

const seasonEpisode = v.object({
  episodeId: v.id("episodes"),
  season: v.number(),
  number: v.number(),
  order: v.number(),
  name: v.string(),
  summary: v.union(v.string(), v.null()),
  runtime: v.union(v.number(), v.null()),
  imageUrl: v.union(v.string(), v.null()),
  airsAt: v.union(v.number(), v.null()),
  airTimeKnown: v.boolean(),
  watched: v.boolean(),
  aired: v.boolean(),
});

function progressEpisodeView(episode: Doc<"episodes">) {
  return {
    episodeId: episode._id,
    season: episode.season,
    number: episode.number,
    order: episode.order,
    name: episode.name,
    summary: episode.summary ?? null,
    runtime: episode.runtime ?? null,
    imageUrl: episode.imageUrl ?? null,
    airsAt: episode.airsAt ?? null,
    airTimeKnown: episode.airTimeKnown,
  };
}

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

export const get = authedQuery({
  args: { tvmazeId: v.number() },
  returns: v.union(
    v.object({
      showId: v.id("shows"),
      tvmazeId: v.number(),
      name: v.string(),
      headerUrl: v.union(v.string(), v.null()),
      posterUrl: v.union(v.string(), v.null()),
      network: v.union(v.string(), v.null()),
      summary: v.union(v.string(), v.null()),
      genres: v.array(v.string()),
      yearSeasons: v.boolean(),
      seasons: v.array(seasonRow),
      myShowId: v.id("myShows"),
      watchLater: v.boolean(),
      stopped: v.boolean(),
      watchedCount: v.number(),
      airedCount: v.number(),
      waitingAfterNext: v.number(),
      leftOff: v.union(
        v.object({
          ...progressEpisode.fields,
          watchedAt: v.number(),
        }),
        v.null()
      ),
      upNext: v.union(progressEpisode, v.null()),
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

    const leftEpisode =
      mine.lastWatchedEpisodeId === undefined
        ? null
        : await ctx.db.get(mine.lastWatchedEpisodeId);
    const nextEpisode =
      mine.nextEpisodeId === undefined
        ? null
        : await ctx.db.get(mine.nextEpisodeId);

    return {
      showId: show._id,
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
      myShowId: mine._id,
      watchLater: mine.watchLater,
      stopped: mine.stoppedAt !== undefined,
      watchedCount: mine.watchedCount,
      airedCount: mine.airedCount,
      waitingAfterNext: mine.waitingAfterNext,
      leftOff:
        leftEpisode === null || mine.lastWatchedAt === undefined
          ? null
          : {
              ...progressEpisodeView(leftEpisode),
              watchedAt: mine.lastWatchedAt,
            },
      upNext: nextEpisode === null ? null : progressEpisodeView(nextEpisode),
    };
  },
});

export const season = authedQuery({
  args: { showId: v.id("shows"), season: v.number() },
  returns: v.object({
    showName: v.string(),
    yearSeasons: v.boolean(),
    headerUrl: v.union(v.string(), v.null()),
    posterUrl: v.union(v.string(), v.null()),
    episodes: v.array(seasonEpisode),
  }),
  handler: async (ctx, args) => {
    const show = await ctx.db.get(args.showId);
    if (show === null) raise(ERROR_CODES.INVALID, "Show not found");
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", ctx.userId).eq("showId", args.showId)
      )
      .unique();
    if (mine === null) raise(ERROR_CODES.NOT_PERMITTED);

    const now = Date.now();
    const episodes = await ctx.db
      .query("episodes")
      .withIndex("by_show_season", (q) =>
        q.eq("showId", args.showId).eq("season", args.season)
      )
      .collect();
    const ticks = await ctx.db
      .query("watchedEpisodes")
      .withIndex("by_user_show_season", (q) =>
        q
          .eq("userId", ctx.userId)
          .eq("showId", args.showId)
          .eq("season", args.season)
      )
      .collect();
    const watched = new Set(ticks.map((tick) => tick.episodeId));
    episodes.sort((left, right) => left.number - right.number);

    return {
      showName: show.name,
      yearSeasons: show.yearSeasons,
      headerUrl: show.headerUrl ?? null,
      posterUrl: show.posterUrl ?? null,
      episodes: episodes.map((episode) => ({
        episodeId: episode._id,
        season: episode.season,
        number: episode.number,
        order: episode.order,
        name: episode.name,
        summary: episode.summary ?? null,
        runtime: episode.runtime ?? null,
        imageUrl: episode.imageUrl ?? null,
        airsAt: episode.airsAt ?? null,
        airTimeKnown: episode.airTimeKnown,
        watched: watched.has(episode._id),
        aired: hasAired(episode, now),
      })),
    };
  },
});
