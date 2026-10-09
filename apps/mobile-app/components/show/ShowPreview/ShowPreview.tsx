import React from "react";

import { joinMeta, seasonsLabel } from "@/utils";

import Button from "../../ui/Button/Button";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import GenreList from "../GenreList/GenreList";
import ShowHero from "../ShowHero/ShowHero";
import ShowSummary from "../ShowSummary/ShowSummary";
import TvmazeCredit from "../TvmazeCredit/TvmazeCredit";

interface ShowPreviewProps {
  show: {
    tvmazeId: number;
    name: string;
    genres: string[];
    status: string;
    seasonCount: number;
    summary: string | null;
    network: string | null;
    rating: number | null;
  };
  width: number;
  adding: boolean;
  onAdd: () => void;
}

const ShowPreview: React.FC<ShowPreviewProps> = ({
  show,
  width,
  adding,
  onAdd,
}) => {
  const rated = show.rating === null ? null : `Rated ${show.rating}`;

  return (
    <>
      <ShowHero
        width={width}
        name={show.name}
        meta={joinMeta([
          seasonsLabel(show.seasonCount),
          show.network,
          show.status,
          rated,
        ])}
      >
        <GenreList genres={show.genres} />
      </ShowHero>
      <VStack spacing="lg" className="mt-6 bg-page px-5 pb-10">
        <Button
          text="Add to my list"
          size="lg"
          fullWidth
          disabled={adding}
          onPress={onAdd}
        />
        {show.summary ? (
          <VStack spacing="sm">
            <Text className="font-app-semibold text-xl text-text">About</Text>
            <ShowSummary text={show.summary} />
          </VStack>
        ) : null}
        <TvmazeCredit tvmazeId={show.tvmazeId} />
      </VStack>
    </>
  );
};

export default ShowPreview;
