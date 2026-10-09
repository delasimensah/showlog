import React from "react";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { COLORS, FONTS } from "@/constants";
import { fillOpacity } from "@/utils";

interface ShowHeaderTitleProps {
  name: string;
  scrollY: SharedValue<number>;
  threshold: number;
}

const ShowHeaderTitle: React.FC<ShowHeaderTitleProps> = ({
  name,
  scrollY,
  threshold,
}) => {
  const style = useAnimatedStyle(() => ({
    opacity: fillOpacity(scrollY.value, threshold),
  }));

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        { color: COLORS.text, fontFamily: FONTS.semibold, fontSize: 17 },
        style,
      ]}
    >
      {name}
    </Animated.Text>
  );
};

export default ShowHeaderTitle;
