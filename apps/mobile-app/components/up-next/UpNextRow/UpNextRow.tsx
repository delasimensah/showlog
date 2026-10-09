import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { episodeLabel, episodeSeasonLine } from "shared";

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
  onTick: () => void;
}

const SLIDE = 36;
const TICK_HOLD_MS = 320;

const UpNextRow: React.FC<UpNextRowProps> = ({ row, onTick }) => {
  const router = useRouter();
  const shift = useSharedValue(0);
  const awaitingEnter = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shown, setShown] = useState(row);
  const [ticked, setTicked] = useState(false);
  const display = row.episodeId === shown.episodeId ? row : shown;
  const seasonLine = episodeSeasonLine({
    yearSeasons: display.yearSeasons,
    season: display.season,
    number: display.number,
  });
  const motionStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.abs(shift.value),
    transform: [{ translateX: shift.value * SLIDE }],
  }));

  useEffect(() => {
    return () => {
      if (holdTimer.current !== null) clearTimeout(holdTimer.current);
    };
  }, []);

  useEffect(() => {
    if (row.episodeId === shown.episodeId) return;
    const next = row;
    awaitingEnter.current = true;
    shift.set(
      withTiming(-1, { duration: 180 }, (finished) => {
        if (!finished) return;
        shift.set(1);
        runOnJS(setShown)(next);
        runOnJS(setTicked)(false);
      })
    );
  }, [row, shown.episodeId, shift]);

  useEffect(() => {
    if (!awaitingEnter.current) return;
    awaitingEnter.current = false;
    shift.set(withTiming(0, { duration: 220 }));
  }, [shown.episodeId, shift]);

  return (
    <HStack
      align="center"
      spacing="sm"
      className="overflow-hidden rounded-2xl bg-surface px-4 py-3"
    >
      <Animated.View style={[{ flex: 1, minWidth: 0 }, motionStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={display.showName}
          onPress={() => router.push(`/show/${display.tvmazeId}`)}
          className="min-w-0 flex-1"
        >
          <HStack align="center" spacing="sm">
            <EpisodeImage
              uri={display.imageUrl ?? display.headerUrl ?? display.posterUrl}
            />
            <VStack spacing="xs" className="min-w-0 flex-1">
              <Text
                className="font-app-bold text-[15px] text-text"
                numberOfLines={1}
              >
                {display.showName}
              </Text>
              {seasonLine !== null ? (
                <Text className="font-app-medium text-[13px] text-muted">
                  {seasonLine}
                </Text>
              ) : null}
              <HStack align="center" spacing="xs">
                <Text className="font-app-semibold text-[13px] text-primary">
                  {episodeLabel(display)}
                </Text>
                {display.waitingAfterNext > 0 ? (
                  <Chip label={`+${display.waitingAfterNext}`} />
                ) : null}
              </HStack>
              <HStack spacing="none" className="min-w-0">
                <Text
                  className="shrink font-app-medium text-[13px] text-muted"
                  numberOfLines={1}
                >
                  {display.name}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </Pressable>
      </Animated.View>
      <TickButton
        watched={ticked}
        onPress={() => {
          if (ticked) return;
          setTicked(true);
          holdTimer.current = setTimeout(() => {
            onTick();
          }, TICK_HOLD_MS);
        }}
      />
    </HStack>
  );
};

export default UpNextRow;
