import React from "react";
import { Pressable } from "react-native";

import { watchedShare } from "@/utils";

import Poster from "../../ui/Poster/Poster";
import ProgressBar from "../../ui/ProgressBar/ProgressBar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ShowPosterProps {
  name: string;
  posterUrl: string | null;
  watchedCount: number;
  airedCount: number;
  width: number;
  onPress: () => void;
}

const ShowPoster: React.FC<ShowPosterProps> = ({
  name,
  posterUrl,
  watchedCount,
  airedCount,
  width,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={{ width }}
    >
      <VStack spacing="none" align="stretch">
        <Poster uri={posterUrl} width={width} accessibilityLabel="" />
        <HStack className="mt-2">
          <ProgressBar value={watchedShare(watchedCount, airedCount)} />
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
