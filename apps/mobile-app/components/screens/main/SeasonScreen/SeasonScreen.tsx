import type { Id } from "@convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import {
  useBottomsheetStore,
  useOpenedAt,
  useSeason,
  useShow,
  useTickEpisode,
  useUntickEpisode,
  useWatchSeason,
  useWatchUpTo,
} from "@/hooks";
import { playTickHaptic, showErrorToast } from "@/utils";

import EpisodeRow from "../../../show/EpisodeRow/EpisodeRow";
import ShowSeasonTitle from "../../../show/ShowSeasonTitle/ShowSeasonTitle";
import WatchSeasonButton from "../../../show/WatchSeasonButton/WatchSeasonButton";
import { VStack } from "../../../ui/Stack/Stack";
import SeasonScreenSkeleton from "./SeasonScreenSkeleton";

const SCREEN_PADDING = 20;

interface ListedShow {
  showId: Id<"shows">;
  name: string;
  yearSeasons: boolean;
  headerUrl: string | null;
  posterUrl: string | null;
}

function failureMessage(error: unknown) {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string };
    if (data.message) return data.message;
  }
  return "Could not update this episode.";
}

const SeasonScreen: React.FC<{
  tvmazeId: number;
  seasonNumber: number;
}> = ({ tvmazeId, seasonNumber }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const listed = useShow(tvmazeId) as ListedShow | null | undefined;
  const showId = listed?.showId;
  const season = useSeason(showId, seasonNumber);
  const tick = useTickEpisode({ showId, season: seasonNumber, tvmazeId });
  const untick = useUntickEpisode({ showId, season: seasonNumber, tvmazeId });
  const watchSeason = useWatchSeason({
    showId,
    season: seasonNumber,
    tvmazeId,
  });
  const watchUpTo = useWatchUpTo({ showId, season: seasonNumber, tvmazeId });
  const openEpisodeSheet = useBottomsheetStore().openEpisodeSheet;
  const now = useOpenedAt();
  const yearSeasons = listed?.yearSeasons ?? false;
  const title = yearSeasons ? String(seasonNumber) : `Season ${seasonNumber}`;
  const showName = season?.showName ?? listed?.name ?? "";
  const episodesLeft =
    season?.episodes.some((episode) => episode.aired && !episode.watched) ??
    false;

  const report = (error: unknown) => {
    showErrorToast(failureMessage(error));
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "",
      headerTitle: () => <ShowSeasonTitle title={title} showName={showName} />,
    });
  }, [navigation, showName, title]);

  return (
    <>
      <WatchSeasonButton
        done={season !== undefined && !episodesLeft}
        disabled={season === undefined || showId === undefined}
        onPress={() => {
          if (showId === undefined) return;
          playTickHaptic();
          void watchSeason({ showId, season: seasonNumber }).catch(report);
        }}
      />
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: 40,
        }}
      >
        {season === undefined ? (
          <SeasonScreenSkeleton width={width} />
        ) : (
          <VStack spacing="none">
            {season.episodes.map((episode) => (
              <EpisodeRow
                key={episode.episodeId}
                width={width - SCREEN_PADDING * 2}
                yearSeasons={season.yearSeasons}
                season={episode.season}
                number={episode.number}
                order={episode.order}
                name={episode.name}
                imageUrl={episode.imageUrl}
                fallbackUrl={season.headerUrl ?? season.posterUrl}
                airsAt={episode.airsAt}
                aired={episode.aired}
                watched={episode.watched}
                now={now}
                onOpen={() => {
                  if (showId === undefined) return;
                  openEpisodeSheet({
                    episodeId: episode.episodeId,
                    showId,
                    tvmazeId,
                    season: episode.season,
                    number: episode.number,
                    order: episode.order,
                    name: episode.name,
                    summary: episode.summary,
                    airsAt: episode.airsAt,
                    airTimeKnown: episode.airTimeKnown,
                    runtime: episode.runtime,
                    imageUrl: episode.imageUrl,
                    headerUrl: season.headerUrl,
                    posterUrl: season.posterUrl,
                    watched: episode.watched,
                    aired: episode.aired,
                    yearSeasons: season.yearSeasons,
                  });
                }}
                onTick={() => {
                  const run = episode.watched ? untick : tick;
                  void run({ episodeId: episode.episodeId }).catch(report);
                }}
                onWatchUpTo={() => {
                  playTickHaptic();
                  void watchUpTo({ episodeId: episode.episodeId }).catch(
                    report
                  );
                }}
              />
            ))}
          </VStack>
        )}
      </ScrollView>
    </>
  );
};

export default SeasonScreen;
