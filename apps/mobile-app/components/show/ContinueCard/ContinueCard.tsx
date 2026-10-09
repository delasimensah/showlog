import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

const ContinueCard: React.FC = () => {
  return (
    <VStack className="rounded-2xl bg-surface p-4">
      <HStack align="center" spacing="md">
        <Ionicons name="play-circle" size={36} color={COLORS.primary} />
        <VStack spacing="xs" className="min-w-0 flex-1">
          <Text className="font-app-medium text-[13px] text-muted">
            Where you left off
          </Text>
          <Text className="font-app-bold text-[17px] text-text">
            Start with S1 | E1
          </Text>
          <Text className="font-app-regular text-[13px] text-muted">
            Nothing watched yet
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default ContinueCard;
