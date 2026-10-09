import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";
import { watchedShare } from "@/utils";

import ProgressBar from "../../ui/ProgressBar/ProgressBar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ShowSeasonRowProps {
  label: string;
  watchedCount: number;
  episodeCount: number;
  first: boolean;
  onPress: () => void;
}

const ShowSeasonRow: React.FC<ShowSeasonRowProps> = ({
  label,
  watchedCount,
  episodeCount,
  first,
  onPress,
}) => {
  const done = episodeCount > 0 && watchedCount >= episodeCount;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <VStack
        spacing="sm"
        className={`px-4 py-3.5 ${first ? "" : "border-t border-border"}`.trim()}
      >
        <HStack align="center" spacing="sm">
          <Text className="min-w-0 flex-1 font-app-bold text-[17px] text-text">
            {label}
          </Text>
          {done ? (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.primary}
            />
          ) : (
            <Text className="font-app-medium text-[13px] text-muted">
              {watchedCount}/{episodeCount}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </HStack>
        <HStack>
          <ProgressBar value={watchedShare(watchedCount, episodeCount)} />
        </HStack>
      </VStack>
    </Pressable>
  );
};

export default ShowSeasonRow;
