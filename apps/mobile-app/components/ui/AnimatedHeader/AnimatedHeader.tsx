import React from "react";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HStack } from "../Stack/Stack";

interface AnimatedHeaderProps {
  title: string;
  scrollY: SharedValue<number>;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  scrollY,
  left,
  right,
}) => {
  const insets = useSafeAreaInsets();

  // Calculate threshold: when large title starts going behind the fixed header
  // Small title should appear when scroll reaches the large title height
  const SCROLL_THRESHOLD = 60 - 10; // Start fading in slightly before

  // Animated style for small title (fades in when large title goes behind header)
  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 20, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Header border opacity (becomes visible when title appears)
  const headerBorderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <Animated.View
      style={{
        paddingTop: insets.top,
      }}
    >
      <HStack align="center" justify="between" className="h-14 px-5">
        <HStack align="center" spacing="sm" className="min-w-0 flex-1">
          {left}
          <Animated.Text
            className="font-app-extrabold text-2xl text-text"
            style={smallTitleStyle}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        </HStack>
        {right}
      </HStack>

      <Animated.View
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-border"
        style={headerBorderStyle}
      />
    </Animated.View>
  );
};

export default AnimatedHeader;
