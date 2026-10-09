import { MenuView } from "@expo/ui/community/menu";
import React from "react";
import { Pressable } from "react-native";
import {
  countdownText,
  episodeLabel,
  episodeSeasonLine,
  formatAirDate,
} from "shared";

import EpisodeImage from "../../ui/EpisodeImage/EpisodeImage";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import TickButton from "../../ui/TickButton/TickButton";

const ROW_GAP = 8;
const TICK_SIZE = 40;
const COUNTDOWN_WIDTH = 72;

interface EpisodeRowProps {
  /** Full width of the row. The native menu needs a fixed width to lay the row out. */
  width: number;
  yearSeasons: boolean;
  season: number;
  number: number;
  order: number;
  name: string;
  imageUrl: string | null;
  fallbackUrl: string | null;
  airsAt: number | null;
  aired: boolean;
  watched: boolean;
  now: number;
  onOpen: () => void;
  onTick: () => void;
  onWatchUpTo: () => void;
}

const EpisodeRow: React.FC<EpisodeRowProps> = ({
  width,
  yearSeasons,
  season,
  number,
  order,
  name,
  imageUrl,
  fallbackUrl,
  airsAt,
  aired,
  watched,
  now,
  onOpen,
  onTick,
  onWatchUpTo,
}) => {
  const seasonLine = episodeSeasonLine({ yearSeasons, season, number });
  const date = airsAt === null ? "No date yet" : formatAirDate(airsAt, now);
  const meta = seasonLine === null ? date : `${seasonLine} · ${date}`;
  const trailingWidth = aired ? TICK_SIZE : COUNTDOWN_WIDTH;
  const infoWidth = width - trailingWidth - ROW_GAP;

  return (
    <HStack align="center" spacing="sm" className="py-3">
      <MenuView
        shouldOpenOnLongPress
        style={{ width: infoWidth }}
        actions={
          aired ? [{ id: "watch-up-to", title: "Watched up to here" }] : []
        }
        onPressAction={(event) => {
          if (event.nativeEvent.event === "watch-up-to") onWatchUpTo();
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={{ width: infoWidth }}
        >
          <HStack align="center" spacing="sm">
            <EpisodeImage uri={imageUrl ?? fallbackUrl} dimmed={!aired} />
            <VStack spacing="xs" className="min-w-0 flex-1">
              <Text className="font-app-medium text-[13px] text-muted">
                {episodeLabel({ yearSeasons, season, number, order })}
              </Text>
              <Text
                className="font-app-semibold text-[15px] text-text"
                numberOfLines={2}
              >
                {name}
              </Text>
              <Text className="font-app-medium text-[13px] text-muted">
                {meta}
              </Text>
            </VStack>
          </HStack>
        </Pressable>
      </MenuView>
      {aired ? (
        <TickButton watched={watched} onPress={onTick} />
      ) : (
        <Text
          className="text-right font-app-semibold text-[13px] text-muted"
          style={{ width: COUNTDOWN_WIDTH }}
          numberOfLines={1}
        >
          {airsAt === null ? "No date yet" : countdownText(airsAt, now)}
        </Text>
      )}
    </HStack>
  );
};

export default EpisodeRow;
