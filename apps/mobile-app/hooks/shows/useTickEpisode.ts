import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";

function finishedEpisode<Episode extends { episodeId: string }>(
  show: { upNext: Episode | null; waitingAfterNext: number },
  episodeId: string
) {
  const next = show.upNext;
  if (!next || next.episodeId !== episodeId || show.waitingAfterNext !== 0) {
    return {};
  }
  return {
    leftOff: { ...next, watchedAt: Date.now() },
    upNext: null,
  };
}

export function useTickEpisode(target: {
  showId: Id<"shows"> | undefined;
  season: number;
  tvmazeId: number;
}) {
  return useMutation(api.watching.tick).withOptimisticUpdate(
    (localStore, args) => {
      if (target.showId !== undefined) {
        const seasonQuery = { showId: target.showId, season: target.season };
        const seasonResult = localStore.getQuery(api.shows.season, seasonQuery);
        if (seasonResult !== undefined) {
          const already = seasonResult.episodes.some(
            (episode) => episode.episodeId === args.episodeId && episode.watched
          );
          if (already) return;
          localStore.setQuery(api.shows.season, seasonQuery, {
            ...seasonResult,
            episodes: seasonResult.episodes.map((episode) =>
              episode.episodeId === args.episodeId
                ? { ...episode, watched: true }
                : episode
            ),
          });
        }
      }

      const show = localStore.getQuery(api.shows.get, {
        tvmazeId: target.tvmazeId,
      });
      if (show === undefined || show === null) return;
      localStore.setQuery(
        api.shows.get,
        { tvmazeId: target.tvmazeId },
        {
          ...show,
          watchedCount: show.watchedCount + 1,
          seasons: show.seasons.map((season) =>
            season.number === target.season
              ? { ...season, watchedCount: season.watchedCount + 1 }
              : season
          ),
          ...finishedEpisode(show, args.episodeId),
        }
      );
    }
  );
}
