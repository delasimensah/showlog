import React from "react";
import { useWindowDimensions } from "react-native";

import { posterColumnWidth } from "@/utils";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const NAME_WIDTHS = [
  0.7, 0.5, 0.85, 0.6, 0.45, 0.75, 0.65, 0.55, 0.8, 0.48, 0.72, 0.4,
];

function rowsOf<T>(items: T[], count: number) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += count) {
    rows.push(items.slice(index, index + count));
  }
  return rows;
}

const MyShowsScreenSkeleton: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth = posterColumnWidth(screenWidth);

  return (
    <VStack spacing="md" className="px-5 py-4">
      {rowsOf(NAME_WIDTHS, 3).map((row, rowIndex) => (
        <HStack key={rowIndex} spacing="none" className="gap-3">
          {row.map((nameWidth) => (
            <VStack
              key={nameWidth}
              spacing="none"
              style={{ width: columnWidth }}
            >
              <SkeletonCard
                width={columnWidth}
                height={columnWidth * 1.5}
                radius={10}
              />
              <SkeletonCard width={columnWidth} height={6} radius={3} mt={8} />
              <SkeletonCard
                width={columnWidth * nameWidth}
                height={9}
                radius={4}
                mt={6}
              />
            </VStack>
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

export default MyShowsScreenSkeleton;
