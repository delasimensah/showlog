import React from "react";
import { Pressable } from "react-native";

import { watchedShare } from "@/utils";

import Poster from "../../ui/Poster/Poster";
import ProgressBar, {
  type ProgressTone,
} from "../../ui/ProgressBar/ProgressBar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ShowPosterProps {
  name: string;
  posterUrl: string | null;
  watchedCount: number;
  airedCount: number;
  watchLater?: boolean;
  stopped?: boolean;
  width: number;
  onPress: () => void;
}

function progressTone(stopped: boolean, watchLater: boolean): ProgressTone {
  if (stopped) return "stopped";
  if (watchLater) return "later";
  return "mint";
}

const ShowPoster: React.FC<ShowPosterProps> = ({
  name,
  posterUrl,
  watchedCount,
  airedCount,
  watchLater = false,
  stopped = false,
  width,
  onPress,
}) => {
  const label = stopped
    ? `${name}, Stopped`
    : watchLater
      ? `${name}, Watch later`
      : name;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width }}
    >
      <VStack spacing="none" align="stretch">
        <Poster uri={posterUrl} width={width} accessibilityLabel="" />
        <HStack className="mt-2">
          <ProgressBar
            value={watchedShare(watchedCount, airedCount)}
            tone={progressTone(stopped, watchLater)}
          />
        </HStack>
        <Text
          className="mt-1.5 font-app-semibold text-[13px] text-text"
          numberOfLines={1}
        >
          {name}
        </Text>
      </VStack>
    </Pressable>
  );
};

export default ShowPoster;
