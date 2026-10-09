import React from "react";
import { useWindowDimensions } from "react-native";

import { headerTitleFrame } from "@/utils";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ShowSeasonTitleProps {
  title: string;
  showName: string;
}

const ShowSeasonTitle: React.FC<ShowSeasonTitleProps> = ({
  title,
  showName,
}) => {
  const { width } = useWindowDimensions();

  return (
    <VStack
      pointerEvents="none"
      spacing="none"
      align="stretch"
      style={headerTitleFrame(width, "label")}
    >
      <Text
        className="text-center font-app-semibold text-[17px] text-text"
        numberOfLines={1}
      >
        {title}
      </Text>
      {showName.length > 0 ? (
        <Text
          className="text-center font-app-medium text-[12px] text-muted"
          numberOfLines={1}
        >
          {showName}
        </Text>
      ) : null}
    </VStack>
  );
};

export default ShowSeasonTitle;
