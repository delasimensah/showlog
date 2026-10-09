import React from "react";
import { Linking, Pressable } from "react-native";

import Text from "../../ui/Text/Text";

interface TvmazeCreditProps {
  tvmazeId: number;
}

const TvmazeCredit: React.FC<TvmazeCreditProps> = ({ tvmazeId }) => {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => {
        void Linking.openURL(`https://www.tvmaze.com/shows/${tvmazeId}`);
      }}
    >
      <Text className="font-app-medium text-[13px] text-primary">
        Show data from TVmaze
      </Text>
    </Pressable>
  );
};

export default TvmazeCredit;
