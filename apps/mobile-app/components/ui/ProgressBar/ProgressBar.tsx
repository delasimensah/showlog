import React from "react";
import { View } from "react-native";

export type ProgressTone = "mint" | "later" | "stopped";

interface ProgressBarProps {
  /** Watched share, from 0 to 1. */
  value: number;
  tone?: ProgressTone;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, tone = "mint" }) => {
  const ratio = Math.min(1, Math.max(0, value));

  return (
    <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
      <View
        className={
          tone === "stopped"
            ? "h-1.5 rounded-full bg-danger"
            : tone === "later"
              ? "h-1.5 rounded-full bg-later"
              : "h-1.5 rounded-full bg-primary"
        }
        style={{ width: `${ratio * 100}%` }}
      />
    </View>
  );
};

export default ProgressBar;
