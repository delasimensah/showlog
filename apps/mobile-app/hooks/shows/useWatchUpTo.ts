import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";

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
      localStore.setQuery(
        api.shows.get,
        { tvmazeId: target.tvmazeId },
        {
          ...show,
          watchedCount: show.watchedCount + added,
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
