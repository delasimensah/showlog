import React from "react";

import SkeletonCard from "../../ui/SkeletonCard/SkeletonCard";
import { VStack } from "../../ui/Stack/Stack";

const LoadingScreen: React.FC = () => {
  return (
    <VStack spacing="md" className="flex-1 justify-center bg-page px-5">
      <SkeletonCard width={180} height={14} radius={4} />
      <SkeletonCard width={240} height={9} radius={4} />
      <SkeletonCard width={140} height={9} radius={4} />
    </VStack>
  );
};

export default LoadingScreen;
