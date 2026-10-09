import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { COLORS } from "@/constants";

import { VStack } from "../../ui/Stack/Stack";
import TvMark from "../../ui/TvMark/TvMark";

interface ShowPictureProps {
  uri: string | null;
  width: number;
  contained?: boolean;
  scrollY: SharedValue<number>;
}

const ShowPicture: React.FC<ShowPictureProps> = ({
  uri,
  width,
  contained,
  scrollY,
}) => {
  const restHeight = width * (10 / 16);
  const posterWidth = restHeight * (2 / 3);
  const frameStyle = useAnimatedStyle(() => {
    const offset = scrollY.value;
    if (offset < 0) {
      return { height: restHeight - offset, transform: [{ translateY: 0 }] };
    }
    return { height: restHeight, transform: [{ translateY: -offset }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width,
          overflow: "hidden",
          backgroundColor: COLORS.surface,
        },
        frameStyle,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={
            contained
              ? { width: posterWidth, height: restHeight, alignSelf: "center" }
              : StyleSheet.absoluteFill
          }
          contentFit="cover"
          transition={150}
          accessibilityLabel="Show header"
        />
      ) : (
        <VStack align="center" justify="center" className="flex-1">
          <TvMark size={48} />
        </VStack>
      )}
      <LinearGradient
        colors={["transparent", COLORS.page]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: restHeight * 0.55,
        }}
      />
    </Animated.View>
  );
};

export default ShowPicture;
