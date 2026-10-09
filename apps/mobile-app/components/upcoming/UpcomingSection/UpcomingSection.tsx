import React from "react";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import UpcomingRow, {
  type UpcomingEpisode,
  type UpcomingNoDate,
} from "../UpcomingRow/UpcomingRow";

interface UpcomingSectionProps {
  title: string;
  /** "9 Oct" beside the day name. */
  date?: string | null;
  rows: (UpcomingEpisode | UpcomingNoDate)[];
}

const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  title,
  date = null,
  rows,
}) => {
  return (
    <VStack spacing="none">
      <HStack align="center" justify="between" className="mb-3 px-1">
        <Text className="font-app-semibold text-xl text-text">{title}</Text>
        {date !== null ? (
          <Text className="font-app-medium text-[13px] text-muted">{date}</Text>
        ) : null}
      </HStack>
      <VStack spacing="md">
        {rows.map((row) => (
          <UpcomingRow
            key={
              "episodeName" in row
                ? `${row.tvmazeId}-${row.label}`
                : String(row.tvmazeId)
            }
            row={row}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default UpcomingSection;
