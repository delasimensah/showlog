import React from "react";

import { watchedShare } from "@/utils";

import ProgressBar from "../../ui/ProgressBar/ProgressBar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ProgressSummaryProps {
  watched: number;
  aired: number;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  watched,
  aired,
}) => {
  const percent = Math.round(watchedShare(watched, aired) * 100);

  return (
    <VStack spacing="sm">
      <HStack justify="between" className="items-baseline">
        <Text className="font-app-medium text-[13px] text-muted">
          {watched} of {aired} watched
        </Text>
        <Text className="font-app-bold text-[13px] text-primary">
          {percent}%
        </Text>
      </HStack>
      <HStack>
        <ProgressBar value={watchedShare(watched, aired)} />
      </HStack>
    </VStack>
  );
};

export default ProgressSummary;
