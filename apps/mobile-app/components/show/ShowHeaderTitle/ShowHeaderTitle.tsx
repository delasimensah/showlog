import React from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { COLORS, FONTS } from "@/constants";
import { fillOpacity, headerTitleFrame } from "@/utils";

import { VStack } from "../../ui/Stack/Stack";

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
  const { width } = useWindowDimensions();
  const style = useAnimatedStyle(() => ({
    opacity: fillOpacity(scrollY.value, threshold),
  }));

  return (
    <VStack
      pointerEvents="none"
      spacing="none"
      align="stretch"
      style={headerTitleFrame(width, "icon")}
    >
      <Animated.Text
        numberOfLines={1}
        style={[
          {
            color: COLORS.text,
            fontFamily: FONTS.semibold,
            fontSize: 17,
            textAlign: "center",
          },
          style,
        ]}
      >
        {name}
      </Animated.Text>
    </VStack>
  );
};

export default ShowHeaderTitle;
