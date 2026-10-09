import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import { episodeLabel, formatAirDate } from "shared";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import TickButton from "../../ui/TickButton/TickButton";

export interface ContinueEpisode {
  episodeId: string;
  season: number;
  number: number;
  order: number;
  name: string;
  summary: string | null;
}

interface ContinueCardProps {
  yearSeasons: boolean;
  now: number;
  leftOff: (ContinueEpisode & { watchedAt: number }) | null;
  upNext: ContinueEpisode | null;
  onTick: () => void;
  onOpenLeft: () => void;
  onOpenNext: () => void;
}

function labelFor(episode: ContinueEpisode, yearSeasons: boolean): string {
  return episodeLabel({
    yearSeasons,
    season: episode.season,
    number: episode.number,
    order: episode.order,
  });
}

const ContinueCard: React.FC<ContinueCardProps> = ({
  yearSeasons,
  now,
  leftOff,
  upNext,
  onTick,
  onOpenLeft,
  onOpenNext,
}) => {
  if (leftOff === null && upNext === null) return null;

  if (leftOff === null && upNext !== null) {
    const label = labelFor(upNext, yearSeasons);
    return (
      <HStack
        align="center"
        spacing="md"
        className="rounded-2xl bg-surface p-4"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={upNext.name}
          onPress={onOpenNext}
          className="min-w-0 flex-1"
        >
          <HStack align="center" spacing="md">
            <Ionicons name="play-circle" size={36} color={COLORS.primary} />
            <VStack spacing="sm" className="min-w-0 flex-1">
              <Text className="font-app-bold text-[15px] text-text">
                {`Start with ${label}`}
              </Text>
              <Text className="font-app-regular text-[12px] text-muted">
                Nothing watched yet
              </Text>
            </VStack>
          </HStack>
        </Pressable>
        <TickButton watched={false} onPress={onTick} />
      </HStack>
    );
  }

  if (leftOff === null) return null;

  const watchedLabel = labelFor(leftOff, yearSeasons);
  const nextLabel = upNext === null ? null : labelFor(upNext, yearSeasons);

  return (
    <VStack spacing="md" className="rounded-2xl bg-surface p-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={leftOff.name}
        onPress={onOpenLeft}
      >
        <VStack spacing="sm">
          <Text className="font-app-medium text-[12px] text-muted">
            {`Last watched · ${formatAirDate(leftOff.watchedAt, now)}`}
          </Text>
          <Text className="font-app-semibold text-[12px] text-primary">
            {watchedLabel}
          </Text>
          <Text className="font-app-bold text-[15px] text-text">
            {leftOff.name}
          </Text>
          {leftOff.summary ? (
            <Text
              className="font-app-regular text-[13px] text-text"
              numberOfLines={3}
            >
              {leftOff.summary}
            </Text>
          ) : null}
        </VStack>
      </Pressable>
      {upNext !== null && nextLabel !== null ? (
        <>
          {/* View used: divider line; do not change. */}
          <View className="h-px bg-border" />
          <HStack align="center" spacing="md">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={upNext.name}
              onPress={onOpenNext}
              className="min-w-0 flex-1"
            >
              <VStack spacing="sm">
                <Text className="font-app-medium text-[12px] text-muted">
                  Up next
                </Text>
                <Text className="font-app-semibold text-[12px] text-primary">
                  {nextLabel}
                </Text>
                <Text
                  className="font-app-bold text-[15px] text-text"
                  numberOfLines={2}
                >
                  {upNext.name}
                </Text>
              </VStack>
            </Pressable>
            <TickButton watched={false} onPress={onTick} />
          </HStack>
        </>
      ) : null}
    </VStack>
  );
};

export default ContinueCard;
