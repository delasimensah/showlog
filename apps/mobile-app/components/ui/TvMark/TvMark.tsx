import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { COLORS } from "@/constants";

interface TvMarkProps {
  size?: number;
}

const TvMark: React.FC<TvMarkProps> = ({ size = 48 }) => {
  return <Ionicons name="tv" size={size} color={COLORS.muted} />;
};

export default TvMark;
