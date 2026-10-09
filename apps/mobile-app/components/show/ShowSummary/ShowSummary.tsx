import React, { useState } from "react";
import { Pressable } from "react-native";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

const SUMMARY_CLAMP = 220;

interface ShowSummaryProps {
  text: string;
}

const ShowSummary: React.FC<ShowSummaryProps> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > SUMMARY_CLAMP;

  return (
    <VStack spacing="sm">
      <Text
        className="font-app-regular text-[15px] leading-[22px] text-text"
        numberOfLines={expanded || !canExpand ? undefined : 4}
      >
        {text}
      </Text>
      {canExpand && !expanded ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setExpanded(true);
          }}
        >
          <Text className="font-app-semibold text-[15px] text-primary">
            More
          </Text>
        </Pressable>
      ) : null}
      {canExpand && expanded ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setExpanded(false);
          }}
        >
          <Text className="font-app-semibold text-[15px] text-primary">
            Less
          </Text>
        </Pressable>
      ) : null}
    </VStack>
  );
};

export default ShowSummary;
