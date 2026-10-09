import React from "react";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const SECTIONS = [
  [160, 120, 180],
  [140, 150, 130],
];

const UpcomingScreenSkeleton: React.FC = () => {
  return (
    <VStack spacing="xl" className="px-5 py-4">
      {SECTIONS.map((names) => (
        <VStack key={names.join("-")} spacing="md">
          <HStack align="center" justify="between" className="px-1">
            <SkeletonCard width={80} height={20} radius={4} />
            <SkeletonCard width={44} height={9} radius={4} />
          </HStack>
          {names.map((nameWidth) => (
            <HStack
              key={nameWidth}
              align="center"
              spacing="md"
              className="overflow-hidden rounded-2xl bg-surface px-4 py-3"
            >
              <SkeletonCard width={128} height={72} radius={10} />
              <VStack spacing="xs" className="min-w-0 flex-1">
                <SkeletonCard width={nameWidth} height={11} radius={4} />
                <SkeletonCard width={60} height={9} radius={4} />
                <SkeletonCard width={nameWidth * 0.8} height={9} radius={4} />
              </VStack>
              <SkeletonCard width={44} height={9} radius={4} />
            </HStack>
          ))}
        </VStack>
      ))}
    </VStack>
  );
};

export default UpcomingScreenSkeleton;
