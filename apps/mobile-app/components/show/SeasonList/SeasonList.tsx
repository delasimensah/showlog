import React from "react";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import ShowSeasonRow from "../ShowSeasonRow/ShowSeasonRow";

interface SeasonListProps {
  seasons: {
    number: number;
    episodeCount: number;
    watchedCount: number;
  }[];
  yearSeasons: boolean;
  onOpenSeason: (season: number) => void;
}

const SeasonList: React.FC<SeasonListProps> = ({
  seasons,
  yearSeasons,
  onOpenSeason,
}) => {
  return (
    <VStack spacing="sm">
      <HStack justify="between" className="items-baseline">
        <Text className="font-app-semibold text-xl text-text">Seasons</Text>
        <Text className="font-app-medium text-[13px] text-muted">
          {seasons.length}
        </Text>
      </HStack>
      <VStack spacing="none" className="overflow-hidden rounded-2xl bg-surface">
        {seasons.map((season, index) => (
          <ShowSeasonRow
            key={season.number}
            label={
              yearSeasons ? String(season.number) : `Season ${season.number}`
            }
            watchedCount={season.watchedCount}
            episodeCount={season.episodeCount}
            first={index === 0}
            onPress={() => onOpenSeason(season.number)}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default SeasonList;
