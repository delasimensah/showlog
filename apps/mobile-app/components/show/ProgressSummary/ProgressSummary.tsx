import React from "react";

import { watchedShare } from "@/utils";

import ProgressBar, {
  type ProgressTone,
} from "../../ui/ProgressBar/ProgressBar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ProgressSummaryProps {
  watched: number;
  aired: number;
  watchLater?: boolean;
  stopped?: boolean;
}

function progressTone(stopped: boolean, watchLater: boolean): ProgressTone {
  if (stopped) return "stopped";
  if (watchLater) return "later";
  return "mint";
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  watched,
  aired,
  watchLater = false,
  stopped = false,
}) => {
  const percent = Math.round(watchedShare(watched, aired) * 100);
  const tone = progressTone(stopped, watchLater);

  return (
    <VStack spacing="sm">
      <HStack justify="between" className="items-baseline">
        <Text className="font-app-medium text-[13px] text-muted">
          {watched} of {aired} watched
        </Text>
        <Text
          className={
            tone === "stopped"
              ? "font-app-bold text-[13px] text-danger"
              : tone === "later"
                ? "font-app-bold text-[13px] text-later"
                : "font-app-bold text-[13px] text-primary"
          }
        >
          {stopped ? "Stopped" : `${percent}%`}
        </Text>
      </HStack>
      <HStack>
        <ProgressBar value={watchedShare(watched, aired)} tone={tone} />
      </HStack>
    </VStack>
  );
};

export default ProgressSummary;
