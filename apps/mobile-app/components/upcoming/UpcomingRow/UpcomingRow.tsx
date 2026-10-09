import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import Chip from "../../ui/Chip/Chip";
import EpisodeImage from "../../ui/EpisodeImage/EpisodeImage";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

export interface UpcomingEpisode {
  tvmazeId: number;
  showName: string;
  headerUrl: string | null;
  posterUrl: string | null;
  imageUrl: string | null;
  label: string;
  premiere: boolean;
  episodeName: string;
  primary: string;
}

export interface UpcomingNoDate {
  tvmazeId: number;
  showName: string;
  headerUrl: string | null;
  posterUrl: string | null;
}

interface UpcomingRowProps {
  row: UpcomingEpisode | UpcomingNoDate;
}

function isEpisode(
  row: UpcomingEpisode | UpcomingNoDate
): row is UpcomingEpisode {
  return "episodeName" in row;
}

const UpcomingRow: React.FC<UpcomingRowProps> = ({ row }) => {
  const router = useRouter();
  const episode = isEpisode(row) ? row : null;
  const picture =
    episode !== null
      ? (episode.imageUrl ?? episode.headerUrl ?? episode.posterUrl)
      : (row.headerUrl ?? row.posterUrl);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={row.showName}
      onPress={() => router.push(`/show/${row.tvmazeId}`)}
      className="overflow-hidden rounded-2xl bg-surface px-4 py-3"
    >
      <HStack align="center" spacing="md">
        <EpisodeImage uri={picture} />
        <VStack spacing="xs" className="min-w-0 flex-1">
          <Text
            className="font-app-bold text-[15px] text-text"
            numberOfLines={1}
          >
            {row.showName}
          </Text>
          {episode !== null ? (
            <>
              <HStack align="center" spacing="xs">
                <Text className="font-app-semibold text-[13px] text-primary">
                  {episode.label}
                </Text>
                {episode.premiere ? (
                  <Chip label="Premiere" tone="mint" />
                ) : null}
              </HStack>
              <Text
                className="font-app-medium text-[13px] text-muted"
                numberOfLines={1}
              >
                {episode.episodeName}
              </Text>
            </>
          ) : (
            <Text className="font-app-medium text-[13px] text-muted">
              Waiting for an air date
            </Text>
          )}
        </VStack>
        {episode !== null ? (
          <VStack spacing="xs" align="end">
            <Text className="font-app-semibold text-[13px] text-text">
              {episode.primary}
            </Text>
          </VStack>
        ) : null}
      </HStack>
    </Pressable>
  );
};

export default UpcomingRow;
