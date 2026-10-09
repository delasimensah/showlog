import React from "react";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const SeasonScreenSkeleton: React.FC<{ width: number }> = ({ width }) => {
  return (
    <VStack spacing="lg" className="pt-4">
      {Array.from({ length: 6 }, (_, index) => (
        <HStack key={index} align="center" spacing="sm">
          <SkeletonCard width={128} height={72} radius={10} />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <SkeletonCard width={60} height={9} radius={4} />
            <SkeletonCard width={width * 0.4} height={14} radius={4} />
            <SkeletonCard width={width * 0.28} height={14} radius={4} />
            <SkeletonCard width={72} height={9} radius={4} />
          </VStack>
          <SkeletonCard width={40} height={40} radius={20} />
        </HStack>
      ))}
    </VStack>
  );
};

export default SeasonScreenSkeleton;
