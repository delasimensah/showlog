import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import { VStack } from "../Stack/Stack";

interface HeaderButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  icon,
  accessibilityLabel,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <VStack
        spacing="none"
        align="center"
        justify="center"
        className="h-9 w-9 rounded-full bg-surface"
      >
        <Ionicons name={icon} size={18} color={COLORS.text} />
      </VStack>
    </Pressable>
  );
};

export default HeaderButton;
