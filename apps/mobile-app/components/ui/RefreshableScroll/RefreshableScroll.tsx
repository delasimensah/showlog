import React from "react";
import { RefreshControl, ScrollView } from "react-native";

import { COLORS } from "@/constants";

interface RefreshableScrollProps {
  refreshing: boolean;
  onRefresh: () => void;
  /** Centre a short empty state. A list stays at the top. */
  centered?: boolean;
  testID: string;
  children: React.ReactNode;
}

const RefreshableScroll: React.FC<RefreshableScrollProps> = ({
  refreshing,
  onRefresh,
  centered = false,
  testID,
  children,
}) => {
  return (
    <ScrollView
      testID={testID}
      className="flex-1 bg-page"
      contentInsetAdjustmentBehavior="automatic"
      alwaysBounceVertical
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: centered ? "center" : "flex-start",
        paddingBottom: centered ? 0 : 40,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScroll;
