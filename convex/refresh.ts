import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { recomputeProgress } from "./progress";
import { episodeFields, showFields } from "./shows";
import { copiesFromShowPayload, fetchJson } from "./tvmaze";

/**
 * Steps 1 to 3 of the daily refresh. A premiere alert is added in a later ticket.
 * Only shows TVmaze changed today are fetched again. The rest stay as they are.
 */
export const daily = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const updates = await fetchJson("/updates/shows?since=day");
    const shows: Array<{ showId: Id<"shows">; tvmazeId: number }> =
      await ctx.runQuery(internal.refresh.showsToRefresh, {
        tvmazeIds: updatedShowIds(updates),
      });

    for (const row of shows) {
      const payload = await fetchJson(
        `/shows/${row.tvmazeId}?embed[]=episodes&embed[]=images`
      );
      const { show, episodes } = copiesFromShowPayload(payload);
      if (show.tvmazeId !== row.tvmazeId) {
        throw new Error("TVmaze returned a different show");
      }
      await ctx.runMutation(internal.refresh.apply, {
        showId: row.showId,
        show,
        episodes,
      });
    }
    return null;
  },
});

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

export const apply = internalMutation({
  args: {
    showId: v.id("shows"),
    show: v.object(showFields),
    episodes: v.array(v.object(episodeFields)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.showId);
    if (current === null || current.tvmazeId !== args.show.tvmazeId) {
      throw new Error("TVmaze returned a different show");
    }
    await ctx.db.replace(args.showId, args.show);

    const existing = await ctx.db
      .query("episodes")
      .withIndex("by_show_order", (q) => q.eq("showId", args.showId))
      .collect();
    const ticks = await ticksForShow(ctx, args.showId);
    const incoming = new Map(
      args.episodes.map((episode) => [episode.tvmazeId, episode])
    );
    const kept = new Set<number>();

    for (const episode of existing) {
      const next = incoming.get(episode.tvmazeId);
      if (next === undefined) {
        await removeEpisode(ctx, episode, ticks);
        continue;
      }
      await ctx.db.replace(episode._id, { ...next, showId: args.showId });
      if (next.season !== episode.season) {
        for (const tick of ticks) {
          if (tick.episodeId === episode._id) {
            await ctx.db.patch(tick._id, { season: next.season });
          }
        }
      }
      kept.add(episode.tvmazeId);
    }

    for (const episode of args.episodes) {
      if (kept.has(episode.tvmazeId)) continue;
      await ctx.db.insert("episodes", { ...episode, showId: args.showId });
    }

    const rows = await ctx.db
      .query("myShows")
      .withIndex("by_show", (q) => q.eq("showId", args.showId))
      .collect();
    const now = Date.now();
    for (const row of rows) {
      await recomputeProgress(ctx, row._id, now);
    }
    return null;
  },
});

function updatedShowIds(payload: unknown): number[] {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return [];
  }
  const ids: number[] = [];
  for (const key of Object.keys(payload)) {
    const id = Number(key);
    if (Number.isInteger(id) && id > 0) ids.push(id);
  }
  return ids;
}

async function ticksForShow(ctx: MutationCtx, showId: Id<"shows">) {
  const owners = await ctx.db
    .query("myShows")
    .withIndex("by_show", (q) => q.eq("showId", showId))
    .collect();
  const ticks: Doc<"watchedEpisodes">[] = [];
  for (const owner of owners) {
    const rows = await ctx.db
      .query("watchedEpisodes")
      .withIndex("by_user_show", (q) =>
        q.eq("userId", owner.userId).eq("showId", showId)
      )
      .collect();
    ticks.push(...rows);
  }
  return ticks;
}

async function removeEpisode(
  ctx: MutationCtx,
  episode: Doc<"episodes">,
  ticks: Doc<"watchedEpisodes">[]
) {
  for (const tick of ticks) {
    if (tick.episodeId !== episode._id) continue;
    await ctx.db.delete(tick._id);
    await subtractStats(ctx, tick.userId, tick.minutes);
  }
  await ctx.db.delete(episode._id);
}

async function subtractStats(
  ctx: MutationCtx,
  userId: Id<"users">,
  minutes: number
) {
  const stats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (stats === null) return;
  await ctx.db.patch(stats._id, {
    episodesWatched: Math.max(0, stats.episodesWatched - 1),
    minutesWatched: Math.max(0, stats.minutesWatched - minutes),
  });
}
