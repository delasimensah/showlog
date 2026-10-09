import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { COLORS } from "@/constants";
import { fillOpacity } from "@/utils";

interface ShowHeaderBackgroundProps {
  scrollY: SharedValue<number>;
  threshold: number;
}

const ShowHeaderBackground: React.FC<ShowHeaderBackgroundProps> = ({
  scrollY,
  threshold,
}) => {
  const style = useAnimatedStyle(() => ({
    opacity: fillOpacity(scrollY.value, threshold),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.page }, style]}
    />
  );
};

export default ShowHeaderBackground;
