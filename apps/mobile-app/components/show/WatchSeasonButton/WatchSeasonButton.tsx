import { Stack } from "expo-router";
import React from "react";

import { COLORS, FONTS } from "@/constants";

interface WatchSeasonButtonProps {
  done: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/** The iPhone sizes and pads this pill itself, so the label never crowds the edge. */
const WatchSeasonButton: React.FC<WatchSeasonButtonProps> = ({
  done,
  disabled = false,
  onPress,
}) => {
  const label = done ? "Season watched" : "Watch season";

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button
        accessibilityLabel={label}
        disabled={done || disabled}
        onPress={onPress}
        tintColor={done ? COLORS.muted : COLORS.primary}
        style={{ fontFamily: FONTS.bold, fontSize: 15 }}
      >
        {label}
      </Stack.Toolbar.Button>
    </Stack.Toolbar>
  );
};

export default WatchSeasonButton;
