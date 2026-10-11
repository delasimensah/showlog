import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface SeasonEpisode {
  episodeId: string;
  season?: number;
  number?: number;
  order?: number;
  name?: string;
  summary?: string | null;
  runtime?: number | null;
  imageUrl?: string | null;
  airsAt?: number | null;
  airTimeKnown?: boolean;
  aired: boolean;
  watched: boolean;
}

function leftOffNow(episode: SeasonEpisode, season: number) {
  return {
    episodeId: episode.episodeId as Id<"episodes">,
    season: episode.season ?? season,
    number: episode.number ?? 0,
    order: episode.order ?? 0,
    name: episode.name ?? "",
    summary: episode.summary ?? null,
    runtime: episode.runtime ?? null,
    imageUrl: episode.imageUrl ?? null,
    airsAt: episode.airsAt ?? null,
    airTimeKnown: episode.airTimeKnown ?? false,
    watchedAt: Date.now(),
  };
}

function furthestAired(episodes: SeasonEpisode[]): SeasonEpisode | undefined {
  return episodes.reduce<SeasonEpisode | undefined>((furthest, episode) => {
    if (!episode.aired) return furthest;
    if (
      furthest === undefined ||
      (episode.order ?? 0) > (furthest.order ?? 0)
    ) {
      return episode;
    }
    return furthest;
  }, undefined);
}

export function useWatchSeason(target: {
  showId: Id<"shows"> | undefined;
  season: number;
  tvmazeId: number;
}) {
  return useMutation(api.watching.mutations.watchSeason).withOptimisticUpdate(
    (localStore) => {
      if (target.showId === undefined) return;
      const seasonQuery = { showId: target.showId, season: target.season };
      const seasonResult = localStore.getQuery(
        api.shows.queries.season,
        seasonQuery
      );
      if (seasonResult === undefined) return;
      const added = seasonResult.episodes.filter(
        (episode) => episode.aired && !episode.watched
      ).length;
      if (added === 0) return;

      localStore.setQuery(api.shows.queries.season, seasonQuery, {
        ...seasonResult,
        episodes: seasonResult.episodes.map((episode) =>
          episode.aired ? { ...episode, watched: true } : episode
        ),
      });

      const show = localStore.getQuery(api.shows.queries.get, {
        tvmazeId: target.tvmazeId,
      });
      if (show === undefined || show === null) return;
      const watchedCount = show.watchedCount + added;
      const reached = furthestAired(seasonResult.episodes);
      const caughtUp =
        typeof show.airedCount === "number" && watchedCount >= show.airedCount;
      const currentOrder = show.leftOff?.order ?? -1;
      const leftOff =
        reached === undefined || currentOrder >= (reached.order ?? 0)
          ? show.leftOff
          : leftOffNow(reached, target.season);
      localStore.setQuery(
        api.shows.queries.get,
        { tvmazeId: target.tvmazeId },
        {
          ...show,
          watchLater: false,
          watchedCount,
          waitingAfterNext: caughtUp ? 0 : show.waitingAfterNext,
          leftOff,
          upNext: caughtUp ? null : show.upNext,
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
