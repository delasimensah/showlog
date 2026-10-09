import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";

function leftOffNow(episode: {
  episodeId: Id<"episodes">;
  season: number;
  number: number;
  order: number;
  name: string;
  summary: string | null;
  runtime: number | null;
  imageUrl: string | null;
  airsAt: number | null;
  airTimeKnown: boolean;
}) {
  return {
    episodeId: episode.episodeId,
    season: episode.season,
    number: episode.number,
    order: episode.order,
    name: episode.name,
    summary: episode.summary,
    runtime: episode.runtime,
    imageUrl: episode.imageUrl,
    airsAt: episode.airsAt,
    airTimeKnown: episode.airTimeKnown,
    watchedAt: Date.now(),
  };
}

export function useWatchUpTo(target: {
  showId: Id<"shows"> | undefined;
  season: number;
  tvmazeId: number;
}) {
  return useMutation(api.watching.watchUpTo).withOptimisticUpdate(
    (localStore, args) => {
      if (target.showId === undefined) return;
      const seasonQuery = { showId: target.showId, season: target.season };
      const seasonResult = localStore.getQuery(api.shows.season, seasonQuery);
      if (seasonResult === undefined) return;
      const chosen = seasonResult.episodes.find(
        (episode) => episode.episodeId === args.episodeId
      );
      if (chosen === undefined) return;
      const added = seasonResult.episodes.filter(
        (episode) =>
          episode.aired && !episode.watched && episode.order <= chosen.order
      ).length;

      localStore.setQuery(api.shows.season, seasonQuery, {
        ...seasonResult,
        episodes: seasonResult.episodes.map((episode) =>
          episode.aired && episode.order <= chosen.order
            ? { ...episode, watched: true }
            : episode
        ),
      });

      const show = localStore.getQuery(api.shows.get, {
        tvmazeId: target.tvmazeId,
      });
      if (show === undefined || show === null) return;
      const watchedCount = show.watchedCount + added;
      const caughtUp =
        typeof show.airedCount === "number" && watchedCount >= show.airedCount;
      const currentOrder = show.leftOff?.order ?? -1;
      const leftOff =
        currentOrder >= chosen.order ? show.leftOff : leftOffNow(chosen);
      const marked = new Set(
        seasonResult.episodes
          .filter((episode) => episode.aired && episode.order <= chosen.order)
          .map((episode) => episode.episodeId)
      );
      const upNext =
        caughtUp ||
        (show.upNext !== null &&
          show.upNext !== undefined &&
          marked.has(show.upNext.episodeId))
          ? null
          : show.upNext;
      localStore.setQuery(
        api.shows.get,
        { tvmazeId: target.tvmazeId },
        {
          ...show,
          watchLater: false,
          watchedCount,
          waitingAfterNext: caughtUp ? 0 : show.waitingAfterNext,
          leftOff,
          upNext,
          seasons: show.seasons.map((season) =>
            season.number === target.season
              ? { ...season, watchedCount: season.watchedCount + added }
              : season
          ),
        }
      );
    }
  );
}
