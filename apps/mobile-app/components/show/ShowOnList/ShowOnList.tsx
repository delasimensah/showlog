import React from "react";

import { joinMeta, seasonsLabel } from "@/utils";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import ContinueCard from "../ContinueCard/ContinueCard";
import GenreList from "../GenreList/GenreList";
import ProgressSummary from "../ProgressSummary/ProgressSummary";
import SeasonList from "../SeasonList/SeasonList";
import ShowHero from "../ShowHero/ShowHero";
import ShowSummary from "../ShowSummary/ShowSummary";
import TvmazeCredit from "../TvmazeCredit/TvmazeCredit";

interface ShowOnListProps {
  show: {
    tvmazeId: number;
    name: string;
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
  };
  width: number;
}

const ShowOnList: React.FC<ShowOnListProps> = ({ show, width }) => {
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
        <ContinueCard />
        <SeasonList seasons={show.seasons} yearSeasons={show.yearSeasons} />
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
