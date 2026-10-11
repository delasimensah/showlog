import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";

export function useUntickEpisode(target: {
  showId: Id<"shows"> | undefined;
  season: number;
  tvmazeId: number;
}) {
  return useMutation(api.watching.mutations.untick).withOptimisticUpdate(
    (localStore, args) => {
      if (target.showId === undefined) return;
      const seasonQuery = { showId: target.showId, season: target.season };
      const seasonResult = localStore.getQuery(
        api.shows.queries.season,
        seasonQuery
      );
      if (seasonResult === undefined) return;
      const current = seasonResult.episodes.find(
        (episode) => episode.episodeId === args.episodeId
      );
      if (current === undefined || !current.watched) return;

      localStore.setQuery(api.shows.queries.season, seasonQuery, {
        ...seasonResult,
        episodes: seasonResult.episodes.map((episode) =>
          episode.episodeId === args.episodeId
            ? { ...episode, watched: false }
            : episode
        ),
      });

      const show = localStore.getQuery(api.shows.queries.get, {
        tvmazeId: target.tvmazeId,
      });
      if (show === undefined || show === null) return;
      localStore.setQuery(
        api.shows.queries.get,
        { tvmazeId: target.tvmazeId },
        {
          ...show,
          watchedCount: Math.max(0, show.watchedCount - 1),
          seasons: show.seasons.map((season) =>
            season.number === target.season
              ? {
                  ...season,
                  watchedCount: Math.max(0, season.watchedCount - 1),
                }
              : season
          ),
        }
      );
    }
  );
}
