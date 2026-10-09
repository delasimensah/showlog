import React from "react";
import Animated, {
  type ExitAnimationsValues,
  LinearTransition,
  withTiming,
} from "react-native-reanimated";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import UpNextRow, { type UpNextRowData } from "../UpNextRow/UpNextRow";

function cardExit(values: ExitAnimationsValues) {
  "worklet";
  return {
    initialValues: {
      originX: values.currentOriginX,
      opacity: 1,
    },
    animations: {
      originX: withTiming(values.currentOriginX - 72, { duration: 240 }),
      opacity: withTiming(0, { duration: 240 }),
    },
  };
}

const cardMove = LinearTransition.duration(240);

interface UpNextSectionProps {
  title: string;
  rows: UpNextRowData[];
  onTick: (episodeId: string) => void;
}

const UpNextSection: React.FC<UpNextSectionProps> = ({
  title,
  rows,
  onTick,
}) => {
  return (
    <VStack spacing="none">
      <Text className="mb-3 px-1 font-app-semibold text-xl text-text">
        {title}
      </Text>
      <VStack spacing="md">
        {rows.map((row) => (
          <Animated.View
            key={row.showId}
            layout={cardMove}
            exiting={cardExit}
            collapsable={false}
          >
            <UpNextRow row={row} onTick={() => onTick(row.episodeId)} />
          </Animated.View>
        ))}
      </VStack>
    </VStack>
  );
};

export default UpNextSection;
