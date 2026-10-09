import React from "react";
import { Pressable, View } from "react-native";

import AddButton from "../../ui/AddButton/AddButton";
import Poster from "../../ui/Poster/Poster";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface DiscoverCardProps {
  name: string;
  posterUrl: string;
  year: number | null;
  added: boolean;
  adding: boolean;
  onOpen: () => void;
  onAdd: () => void;
}

const DiscoverCard: React.FC<DiscoverCardProps> = ({
  name,
  posterUrl,
  year,
  added,
  adding,
  onOpen,
  onAdd,
}) => {
  const meta = added ? "Added" : year === null ? null : String(year);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onOpen}
    >
      <VStack spacing="sm" className="w-[120px]">
        <View>
          <Poster uri={posterUrl} size="medium" accessibilityLabel="" />
          <View className="absolute bottom-2 right-2">
            <AddButton added={added} disabled={adding} onPress={onAdd} />
          </View>
        </View>
        <Text
          className="font-app-semibold text-[13px] text-text"
          numberOfLines={2}
        >
          {name}
        </Text>
        {meta !== null ? (
          <Text className="font-app-medium text-[13px] text-muted">{meta}</Text>
        ) : null}
      </VStack>
    </Pressable>
  );
};

export default DiscoverCard;
