import React from "react";

import Chip from "../../ui/Chip/Chip";
import { HStack } from "../../ui/Stack/Stack";

interface GenreListProps {
  genres: string[];
}

const GenreList: React.FC<GenreListProps> = ({ genres }) => {
  if (genres.length === 0) return null;
  return (
    <HStack spacing="sm" className="flex-wrap">
      {genres.map((genre) => (
        <Chip key={genre} label={genre} />
      ))}
    </HStack>
  );
};

export default GenreList;
