import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "expo-router";
import React from "react";

import { useBottomsheetStore, useOpenedAt, useTickEpisode } from "@/hooks";
import { joinMeta, seasonsLabel, showErrorToast } from "@/utils";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import ContinueCard, {
  type ContinueEpisode,
} from "../ContinueCard/ContinueCard";
import GenreList from "../GenreList/GenreList";
import ProgressSummary from "../ProgressSummary/ProgressSummary";
import SeasonList from "../SeasonList/SeasonList";
import ShowHero from "../ShowHero/ShowHero";
import ShowSummary from "../ShowSummary/ShowSummary";
import TvmazeCredit from "../TvmazeCredit/TvmazeCredit";

interface ListedEpisode extends ContinueEpisode {
  runtime: number | null;
  imageUrl: string | null;
  airsAt: number | null;
  airTimeKnown: boolean;
}

interface ShowOnListProps {
  show: {
    showId: string;
    tvmazeId: number;
    name: string;
    headerUrl: string | null;
    posterUrl: string | null;
    network: string | null;
    summary: string | null;
    genres: string[];
    yearSeasons: boolean;
    seasons: {
      number: number;
      episodeCount: number;
      watchedCount: number;
    }[];
    watchedCount: number;
    airedCount: number;
    waitingAfterNext: number;
    leftOff: (ListedEpisode & { watchedAt: number }) | null;
    upNext: ListedEpisode | null;
  };
  width: number;
}

const ShowOnList: React.FC<ShowOnListProps> = ({ show, width }) => {
  const router = useRouter();
  const now = useOpenedAt();
  const openEpisodeSheet = useBottomsheetStore().openEpisodeSheet;
  const tick = useTickEpisode({
    showId: show.showId as Id<"shows">,
    season: show.upNext?.season ?? 1,
    tvmazeId: show.tvmazeId,
  });

  const openEpisode = (episode: ListedEpisode, watched: boolean) => {
    openEpisodeSheet({
      ...episode,
      showId: show.showId,
      tvmazeId: show.tvmazeId,
      headerUrl: show.headerUrl,
      posterUrl: show.posterUrl,
      watched,
      aired: true,
      yearSeasons: show.yearSeasons,
    });
  };

  return (
    <>
      <ShowHero
        width={width}
        name={show.name}
        meta={joinMeta([seasonsLabel(show.seasons.length), show.network])}
      >
        <ProgressSummary watched={show.watchedCount} aired={show.airedCount} />
      </ShowHero>
      <VStack spacing="lg" className="mt-6 bg-page px-5 pb-10">
        <ContinueCard
          yearSeasons={show.yearSeasons}
          now={now}
          leftOff={show.leftOff}
          upNext={show.upNext}
          onTick={() => {
            if (show.upNext === null) return;
            void tick({
              episodeId: show.upNext.episodeId as Id<"episodes">,
            }).catch(() => {
              showErrorToast("Could not mark this episode.");
            });
          }}
          onOpenLeft={() => {
            if (show.leftOff === null) return;
            openEpisode(show.leftOff, true);
          }}
          onOpenNext={() => {
            if (show.upNext === null) return;
            openEpisode(show.upNext, false);
          }}
        />
        <SeasonList
          seasons={show.seasons}
          yearSeasons={show.yearSeasons}
          onOpenSeason={(season) => {
            router.push(`/show/${show.tvmazeId}/season/${season}`);
          }}
        />
        <VStack spacing="sm">
          <Text className="font-app-semibold text-xl text-text">About</Text>
          {show.summary ? <ShowSummary text={show.summary} /> : null}
          <GenreList genres={show.genres} />
          <TvmazeCredit tvmazeId={show.tvmazeId} />
        </VStack>
      </VStack>
    </>
  );
};

export default ShowOnList;
