import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

import { VStack } from "../Stack/Stack";
import TvMark from "../TvMark/TvMark";

interface EpisodeImageProps {
  uri?: string | null;
  fullWidth?: boolean;
  dimmed?: boolean;
}

const EpisodeImage: React.FC<EpisodeImageProps> = ({
  uri,
  fullWidth = false,
  dimmed = false,
}) => {
  return (
    <VStack
      spacing="none"
      align="center"
      justify="center"
      className="overflow-hidden bg-surface"
      style={{
        width: fullWidth ? "100%" : 128,
        height: fullWidth ? undefined : 72,
        aspectRatio: fullWidth ? 16 / 9 : undefined,
        borderRadius: 10,
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessibilityLabel="Episode picture"
        />
      ) : (
        <TvMark size={fullWidth ? 48 : 24} />
      )}
    </VStack>
  );
};

export default EpisodeImage;
