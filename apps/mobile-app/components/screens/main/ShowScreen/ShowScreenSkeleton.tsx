import React from "react";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

interface ShowScreenSkeletonProps {
  width: number;
  preview?: boolean;
}

const ShowScreenSkeleton: React.FC<ShowScreenSkeletonProps> = ({
  width,
  preview = false,
}) => {
  const headerHeight = width * (10 / 16);

  return (
    <VStack spacing="lg" className="pb-8">
      <SkeletonCard width={width} height={headerHeight} radius={0} />
      <VStack spacing="sm" className="px-5">
        <SkeletonCard width={width * 0.7} height={22} radius={6} />
        <SkeletonCard width={width * 0.4} height={9} radius={4} />
        {preview ? (
          <>
            <SkeletonCard width={width - 40} height={50} radius={25} />
            <HStack spacing="sm">
              <SkeletonCard width={72} height={22} radius={11} />
              <SkeletonCard width={72} height={22} radius={11} />
              <SkeletonCard width={72} height={22} radius={11} />
            </HStack>
            <SkeletonCard width={width - 40} height={9} radius={4} />
            <SkeletonCard width={width - 40} height={9} radius={4} />
            <SkeletonCard width={width * 0.8} height={9} radius={4} />
            <SkeletonCard width={width * 0.6} height={9} radius={4} />
          </>
        ) : (
          <>
            <HStack align="center" spacing="sm">
              <SkeletonCard width={width * 0.55} height={4} radius={4} />
              <SkeletonCard width={48} height={9} radius={4} />
            </HStack>
            <SkeletonCard width={width - 40} height={140} radius={16} />
            <SkeletonCard width={width * 0.4} height={14} radius={4} />
            <SkeletonCard width={width * 0.35} height={9} radius={4} />
            <SkeletonCard width={width * 0.35} height={9} radius={4} />
            <SkeletonCard width={width * 0.35} height={9} radius={4} />
            <SkeletonCard width={width * 0.35} height={9} radius={4} />
          </>
        )}
      </VStack>
    </VStack>
  );
};

export default ShowScreenSkeleton;
