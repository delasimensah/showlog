import { v } from "convex/values";
import { showStatus } from "shared";

import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { authedQuery } from "../lib/functions";
import { hasAired, startOfUtcDay } from "../lib/progress";

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

const listStatus = v.union(
  v.literal("Stopped"),
  v.literal("Watch later"),
  v.literal("Not started"),
  v.literal("Finished"),
  v.literal("Up to date"),
  v.literal("Watching")
);

const myShowSort = v.union(
  v.literal("lastWatched"),
  v.literal("lastAdded"),
  v.literal("name")
);

const upcomingEpisode = v.object({
  showId: v.id("shows"),
  tvmazeId: v.number(),
  showName: v.string(),
  headerUrl: v.union(v.string(), v.null()),
  posterUrl: v.union(v.string(), v.null()),
  yearSeasons: v.boolean(),
  network: v.union(v.string(), v.null()),
  episodeId: v.id("episodes"),
  season: v.number(),
  number: v.number(),
  order: v.number(),
  name: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  airsAt: v.number(),
  airTimeKnown: v.boolean(),
});

const upcomingShow = v.object({
  showId: v.id("shows"),
  tvmazeId: v.number(),
  showName: v.string(),
  headerUrl: v.union(v.string(), v.null()),
  posterUrl: v.union(v.string(), v.null()),
});

function withoutAddedAt(row: ListEpisode) {
  const { addedAt: _addedAt, watchedCount: _watchedCount, ...rest } = row;
  return rest;
}

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

export const upNext = authedQuery({
  args: {
    // A new time on each pull, so this read runs again. The list does not use it.
    refreshedAt: v.optional(v.number()),
  },
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

export const myShows = authedQuery({
  args: { sort: myShowSort },
  returns: v.array(
    v.object({
      showId: v.id("shows"),
      tvmazeId: v.number(),
      name: v.string(),
      posterUrl: v.union(v.string(), v.null()),
      watchedCount: v.number(),
      airedCount: v.number(),
      status: listStatus,
    })
  ),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_addedAt", (q) => q.eq("userId", ctx.userId))
      .collect();
    const rows = [];
    for (const row of mine) {
      const show = await ctx.db.get(row.showId);
      if (show === null) continue;
      rows.push({
        showId: show._id,
        tvmazeId: show.tvmazeId,
        name: show.name,
        posterUrl: show.posterUrl ?? null,
        watchedCount: row.watchedCount,
        airedCount: row.airedCount,
        status: showStatus({
          watchedCount: row.watchedCount,
          airedCount: row.airedCount,
          watchLater: row.watchLater,
          stopped: row.stoppedAt !== undefined,
          tvmazeStatus: show.status,
        }),
        addedAt: row.addedAt,
        lastWatchedAt: row.lastWatchedAt ?? null,
      });
    }
    rows.sort((left, right) => {
      if (args.sort === "name") return left.name.localeCompare(right.name);
      if (args.sort === "lastAdded") return right.addedAt - left.addedAt;
      return (right.lastWatchedAt ?? 0) - (left.lastWatchedAt ?? 0);
    });
    return rows.map(
      ({ addedAt: _addedAt, lastWatchedAt: _watched, ...row }) => row
    );
  },
});

/** The TVmaze ids of every show on my list, so search can mark them live. */
export const myTvmazeIds = authedQuery({
  args: {},
  returns: v.array(v.number()),
  handler: async (ctx) => {
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_addedAt", (q) => q.eq("userId", ctx.userId))
      .collect();
    const ids: number[] = [];
    for (const row of mine) {
      const show = await ctx.db.get(row.showId);
      if (show !== null) ids.push(show.tvmazeId);
    }
    return ids;
  },
});

export const upcoming = authedQuery({
  args: { now: v.number() },
  returns: v.object({
    episodes: v.array(upcomingEpisode),
    noDate: v.array(upcomingShow),
  }),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("myShows")
      .withIndex("by_user_addedAt", (q) => q.eq("userId", ctx.userId))
      .collect();
    const episodes = [];
    const noDate = [];

    for (const row of mine) {
      if (row.stoppedAt !== undefined) continue;
      const show = await ctx.db.get(row.showId);
      if (show === null || show.status === "Ended") continue;
      const scheduled = (
        await ctx.db
          .query("episodes")
          .withIndex("by_show_airsAt", (q) =>
            q.eq("showId", show._id).gte("airsAt", startOfUtcDay(args.now))
          )
          .collect()
      ).filter((episode) => !hasAired(episode, args.now));

      if (scheduled.length === 0) {
        const undated = await ctx.db
          .query("episodes")
          .withIndex("by_show_airsAt", (q) =>
            q.eq("showId", show._id).eq("airsAt", undefined)
          )
          .take(1);
        if (undated.length > 0) {
          noDate.push({
            showId: show._id,
            tvmazeId: show.tvmazeId,
            showName: show.name,
            headerUrl: show.headerUrl ?? null,
            posterUrl: show.posterUrl ?? null,
          });
        }
        continue;
      }

      for (const episode of scheduled) {
        if (episode.airsAt === undefined) continue;
        episodes.push({
          showId: show._id,
          tvmazeId: show.tvmazeId,
          showName: show.name,
          headerUrl: show.headerUrl ?? null,
          posterUrl: show.posterUrl ?? null,
          yearSeasons: show.yearSeasons,
          network: show.network ?? null,
          episodeId: episode._id,
          season: episode.season,
          number: episode.number,
          order: episode.order,
          name: episode.name,
          imageUrl: episode.imageUrl ?? null,
          airsAt: episode.airsAt,
          airTimeKnown: episode.airTimeKnown,
        });
      }
    }

    episodes.sort((left, right) => left.airsAt - right.airsAt);
    noDate.sort((left, right) => left.showName.localeCompare(right.showName));
    return { episodes, noDate };
  },
});
