import React, { type ReactNode } from "react";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ShowHeroProps {
  width: number;
  name: string;
  meta: string;
  children?: ReactNode;
}

const ShowHero: React.FC<ShowHeroProps> = ({ width, name, meta, children }) => {
  const restHeight = width * (10 / 16);

  return (
    <VStack
      spacing="sm"
      className="px-5"
      style={{ paddingTop: restHeight - 48 }}
    >
      <Text
        className="font-app-extrabold text-[28px] leading-8 text-text"
        numberOfLines={2}
      >
        {name}
      </Text>
      {meta.length > 0 ? (
        <Text className="font-app-medium text-[13px] text-muted">{meta}</Text>
      ) : null}
      {children}
    </VStack>
  );
};

export default ShowHero;
