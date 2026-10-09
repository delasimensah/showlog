import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { authedQuery } from "./lib/functions";

const RECENT_MS = 30 * 24 * 60 * 60 * 1000;

const listEpisode = v.object({
  showId: v.id("shows"),
  tvmazeId: v.number(),
  showName: v.string(),
  yearSeasons: v.boolean(),
  headerUrl: v.union(v.string(), v.null()),
  posterUrl: v.union(v.string(), v.null()),
  episodeId: v.id("episodes"),
  season: v.number(),
  number: v.number(),
  order: v.number(),
  name: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  waitingAfterNext: v.number(),
  lastWatchedAt: v.union(v.number(), v.null()),
});

type ListEpisode = {
  showId: Id<"shows">;
  tvmazeId: number;
  showName: string;
  yearSeasons: boolean;
  headerUrl: string | null;
  posterUrl: string | null;
  episodeId: Id<"episodes">;
  season: number;
  number: number;
  order: number;
  name: string;
  imageUrl: string | null;
  waitingAfterNext: number;
  lastWatchedAt: number | null;
  watchedCount: number;
  addedAt: number;
};

async function toListEpisode(
  ctx: QueryCtx,
  mine: Doc<"myShows">
): Promise<ListEpisode | null> {
  if (mine.watchLater || mine.stoppedAt !== undefined) return null;
  if (mine.nextEpisodeId === undefined) return null;
  const episode = await ctx.db.get(mine.nextEpisodeId);
  const show = await ctx.db.get(mine.showId);
  if (episode === null || show === null) return null;
  return {
    showId: show._id,
    tvmazeId: show.tvmazeId,
    showName: show.name,
    yearSeasons: show.yearSeasons,
    headerUrl: show.headerUrl ?? null,
    posterUrl: show.posterUrl ?? null,
    episodeId: episode._id,
    season: episode.season,
    number: episode.number,
    order: episode.order,
    name: episode.name,
    imageUrl: episode.imageUrl ?? null,
    waitingAfterNext: mine.waitingAfterNext,
    lastWatchedAt: mine.lastWatchedAt ?? null,
    watchedCount: mine.watchedCount,
    addedAt: mine.addedAt,
  };
}

function withoutAddedAt(row: ListEpisode) {
  const { addedAt: _addedAt, watchedCount: _watchedCount, ...rest } = row;
  return rest;
}

export const upNext = authedQuery({
  args: {},
  returns: v.object({
    upNext: v.array(listEpisode),
    paused: v.array(listEpisode),
    notStarted: v.array(listEpisode),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_addedAt", (q) => q.eq("userId", ctx.userId))
      .collect();
    const rows = (
      await Promise.all(mine.map((row) => toListEpisode(ctx, row)))
    ).filter((row): row is ListEpisode => row !== null);

    const upNextRows: ListEpisode[] = [];
    const paused: ListEpisode[] = [];
    const notStarted: ListEpisode[] = [];
    for (const row of rows) {
      if (row.watchedCount === 0) {
        notStarted.push(row);
      } else if (
        row.lastWatchedAt !== null &&
        now - row.lastWatchedAt < RECENT_MS
      ) {
        upNextRows.push(row);
      } else {
        paused.push(row);
      }
    }

    const byWatched = (left: ListEpisode, right: ListEpisode) =>
      (right.lastWatchedAt ?? 0) - (left.lastWatchedAt ?? 0);
    upNextRows.sort(byWatched);
    paused.sort(byWatched);
    notStarted.sort((left, right) => right.addedAt - left.addedAt);

    return {
      upNext: upNextRows.map(withoutAddedAt),
      paused: paused.map(withoutAddedAt),
      notStarted: notStarted.map(withoutAddedAt),
    };
  },
});
