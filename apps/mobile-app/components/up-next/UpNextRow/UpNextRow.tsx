import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { episodeLabel, episodeSeasonLine, timeAgo } from "shared";

import Chip from "../../ui/Chip/Chip";
import EpisodeImage from "../../ui/EpisodeImage/EpisodeImage";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import TickButton from "../../ui/TickButton/TickButton";

export interface UpNextRowData {
  showId: string;
  tvmazeId: number;
  showName: string;
  yearSeasons: boolean;
  headerUrl: string | null;
  posterUrl: string | null;
  episodeId: string;
  season: number;
  number: number;
  order: number;
  name: string;
  imageUrl: string | null;
  waitingAfterNext: number;
  lastWatchedAt: number | null;
}

interface UpNextRowProps {
  row: UpNextRowData;
  now: number;
  onTick: () => void;
}

const UpNextRow: React.FC<UpNextRowProps> = ({ row, now, onTick }) => {
  const router = useRouter();
  const seasonLine = episodeSeasonLine({
    yearSeasons: row.yearSeasons,
    season: row.season,
    number: row.number,
  });
  const ago =
    row.lastWatchedAt === null ? null : timeAgo(row.lastWatchedAt, now);

  return (
    <HStack align="center" spacing="sm">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={row.showName}
        onPress={() => router.push(`/show/${row.tvmazeId}`)}
        className="min-w-0 flex-1"
      >
        <HStack align="center" spacing="sm">
          <EpisodeImage uri={row.imageUrl ?? row.headerUrl ?? row.posterUrl} />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <Text
              className="font-app-bold text-[17px] text-text"
              numberOfLines={1}
            >
              {row.showName}
            </Text>
            {seasonLine !== null ? (
              <Text className="font-app-medium text-[13px] text-muted">
                {seasonLine}
              </Text>
            ) : null}
            <HStack align="center" spacing="xs">
              <Text className="font-app-semibold text-[13px] text-primary">
                {episodeLabel(row)}
              </Text>
              {row.waitingAfterNext > 0 ? (
                <Chip label={`+${row.waitingAfterNext}`} />
              ) : null}
            </HStack>
            <HStack spacing="none" className="min-w-0">
              <Text
                className="shrink font-app-medium text-[13px] text-muted"
                numberOfLines={1}
              >
                {row.name}
              </Text>
              {ago !== null ? (
                <Text className="font-app-medium text-[13px] text-muted">
                  {` · ${ago}`}
                </Text>
              ) : null}
            </HStack>
          </VStack>
        </HStack>
      </Pressable>
      <TickButton watched={false} onPress={onTick} />
    </HStack>
  );
};

export default UpNextRow;
