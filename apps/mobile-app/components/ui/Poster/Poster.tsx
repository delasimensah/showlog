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
  /** Grid width. Height stays 2:3. */
  width?: number;
  accessibilityLabel: string;
}

const Poster: React.FC<PosterProps> = ({
  uri,
  size = "small",
  width: columnWidth,
  accessibilityLabel,
}) => {
  const sized = SIZES[size];
  const width = columnWidth ?? sized.width;
  const height = columnWidth === undefined ? sized.height : columnWidth * 1.5;

  return (
    // View used: poster frame; do not change.
    <View
      accessible={accessibilityLabel.length > 0}
      accessibilityLabel={accessibilityLabel || undefined}
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
