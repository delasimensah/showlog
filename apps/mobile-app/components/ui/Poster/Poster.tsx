import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

import { COLORS } from "@/constants";

import TvMark from "../TvMark/TvMark";

const SIZES = {
  small: { width: 48, height: 72 },
  medium: { width: 120, height: 180 },
} as const;

interface PosterProps {
  uri?: string | null;
  size?: keyof typeof SIZES;
  accessibilityLabel: string;
}

const Poster: React.FC<PosterProps> = ({
  uri,
  size = "small",
  accessibilityLabel,
}) => {
  const { width, height } = SIZES[size];

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={{
        width,
        height,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width, height }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <TvMark size={size === "small" ? 22 : 36} />
      )}
    </View>
  );
};

export default Poster;
