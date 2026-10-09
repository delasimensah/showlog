import React from "react";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import UpNextRow, { type UpNextRowData } from "../UpNextRow/UpNextRow";

interface UpNextSectionProps {
  title: string;
  rows: UpNextRowData[];
  now: number;
  onTick: (episodeId: string) => void;
}

const UpNextSection: React.FC<UpNextSectionProps> = ({
  title,
  rows,
  now,
  onTick,
}) => {
  return (
    <VStack spacing="none">
      <Text className="mb-3 font-app-semibold text-xl text-text">{title}</Text>
      <VStack spacing="md">
        {rows.map((row) => (
          <UpNextRow
            key={row.episodeId}
            row={row}
            now={now}
            onTick={() => onTick(row.episodeId)}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default UpNextSection;
