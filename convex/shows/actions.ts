import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";
import { ERROR_CODES, raise } from "../lib/errors";
import { chunkEpisodes, showStatus } from "../lib/showModel";
import {
  SHOW_STATUSES,
  copiesFromShowPayload,
  countNumberedSeasons,
  fetchJson,
  toShowCopy,
  type EpisodeCopy,
  type ShowCopy,
} from "../lib/tvmaze";

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
      internal.shows.queries.myShowForTvmaze,
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

    const { showId, created }: { showId: Id<"shows">; created: boolean } =
      await ctx.runMutation(
        internal.shows.mutations.insertShow,
        showArgs(show)
      );
    for (const batch of chunkEpisodes(episodes)) {
      await ctx.runMutation(internal.shows.mutations.insertEpisodeBatch, {
        showId,
        episodes: batch.map(episodeArgs),
        skipDuplicateCheck: created,
      });
    }
    const myShowId: Id<"myShows"> = await ctx.runMutation(
      internal.shows.mutations.attachMyShow,
      { userId, showId }
    );
    return { myShowId };
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
