import React from "react";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const NAME_WIDTHS = [180, 140, 210, 160];

const SearchScreenSkeleton: React.FC = () => {
  return (
    <VStack spacing="md" className="pt-4">
      {NAME_WIDTHS.map((nameWidth) => (
        <HStack key={nameWidth} align="center" spacing="none" className="gap-3">
          <SkeletonCard width={48} height={72} radius={10} />
          <VStack spacing="xs" className="flex-1">
            <SkeletonCard width={nameWidth} height={14} radius={4} />
            <SkeletonCard
              width={Math.round(nameWidth * 0.7)}
              height={9}
              radius={4}
            />
          </VStack>
          <SkeletonCard width={32} height={32} radius={16} />
        </HStack>
      ))}
    </VStack>
  );
};

export default SearchScreenSkeleton;
