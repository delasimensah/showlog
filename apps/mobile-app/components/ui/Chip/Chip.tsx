import React from "react";
import { View } from "react-native";

import Text from "../Text/Text";

interface ChipProps {
  label: string;
  tone?: "text" | "mint";
}

const Chip: React.FC<ChipProps> = ({ label, tone = "text" }) => {
  return (
    <View className="h-[22px] items-center justify-center rounded-full bg-surface px-2">
      <Text
        className={
          tone === "mint"
            ? "font-app-semibold text-xs text-primary"
            : "font-app-semibold text-xs text-text"
        }
      >
        {label}
      </Text>
    </View>
  );
};

export default Chip;
