import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";
import { playTickHaptic } from "@/utils";

import { VStack } from "../Stack/Stack";

interface TickButtonProps {
  watched: boolean;
  onPress: () => void;
}

const TickButton: React.FC<TickButtonProps> = ({ watched, onPress }) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={watched ? "Watched" : "Mark as watched"}
      onPress={() => {
        playTickHaptic();
        onPress();
      }}
      hitSlop={4}
    >
      <VStack
        spacing="none"
        align="center"
        justify="center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: COLORS.primary,
          backgroundColor: watched ? COLORS.primary : "transparent",
        }}
      >
        <Ionicons
          name="checkmark"
          size={20}
          color={watched ? COLORS.onPrimary : COLORS.primary}
        />
      </VStack>
    </Pressable>
  );
};

export default TickButton;
