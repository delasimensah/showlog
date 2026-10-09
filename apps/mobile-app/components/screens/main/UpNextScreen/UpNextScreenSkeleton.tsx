import React from "react";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const NAME_WIDTHS = [160, 120, 180, 140, 150];

const UpNextScreenSkeleton: React.FC = () => {
  return (
    <VStack spacing="md" className="px-5 pt-4">
      <SkeletonCard width={110} height={20} radius={4} />
      {NAME_WIDTHS.map((nameWidth, index) => (
        <HStack key={nameWidth} align="center" spacing="sm">
          <SkeletonCard width={128} height={72} radius={10} />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <SkeletonCard width={nameWidth} height={14} radius={4} />
            <HStack align="center" spacing="xs">
              <SkeletonCard width={60} height={9} radius={4} />
              {index === 0 || index === 2 ? (
                <SkeletonCard width={28} height={18} radius={9} />
              ) : null}
            </HStack>
            <SkeletonCard width={nameWidth * 0.8} height={9} radius={4} />
            <SkeletonCard width={70} height={9} radius={4} />
          </VStack>
          <SkeletonCard width={40} height={40} radius={20} />
        </HStack>
      ))}
    </VStack>
  );
};

export default UpNextScreenSkeleton;
