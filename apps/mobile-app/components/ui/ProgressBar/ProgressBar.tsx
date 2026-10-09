import React from "react";
import { View } from "react-native";

interface ProgressBarProps {
  /** Watched share, from 0 to 1. */
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const ratio = Math.min(1, Math.max(0, value));

  return (
    <View className="h-1 flex-1 overflow-hidden rounded-full bg-surface">
      <View
        className="h-1 rounded-full bg-primary"
        style={{ width: `${ratio * 100}%` }}
      />
    </View>
  );
};

export default ProgressBar;
