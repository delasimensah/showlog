import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

interface AddButtonProps {
  added: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ added, onPress, disabled }) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={added ? "On your list" : "Add"}
      accessibilityState={{ disabled: added || disabled }}
      disabled={added || disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: added ? COLORS.primary : COLORS.surface,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Ionicons
        name={added ? "checkmark" : "add"}
        size={18}
        color={added ? COLORS.onPrimary : COLORS.primary}
      />
    </Pressable>
  );
};

export default AddButton;
