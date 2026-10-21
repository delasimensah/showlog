import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { COLORS } from "@/constants";

interface RefreshableScrollProps {
  refreshing: boolean;
  onRefresh: () => void;
  /** Centre a short empty state in the space under the title. A list stays at the top. */
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
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={COLORS.primary}
      colors={[COLORS.primary]}
    />
  );

  if (centered) {
    return (
      <View className="flex-1 bg-page">
        <ScrollView
          testID={testID}
          style={StyleSheet.absoluteFill}
          contentInsetAdjustmentBehavior="never"
          alwaysBounceVertical
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={refreshControl}
        />
        <View pointerEvents="box-none" className="flex-1">
          {children}
        </View>
      </View>
    );
  }

  // The scroll view has to be the first view. That is what lets the large title
  // collapse into the bar, the same way My shows and Discover do.
  return (
    <ScrollView
      testID={testID}
      className="flex-1 bg-page"
      contentInsetAdjustmentBehavior="automatic"
      alwaysBounceVertical
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScroll;
