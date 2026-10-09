import { ThemeProvider } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

import { COLORS } from "@/constants";
import { navigationTheme } from "@/utils";

const tabScreenStyle = { backgroundColor: COLORS.page };

const AppTabs: React.FC = () => {
  return (
    <ThemeProvider value={navigationTheme}>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        disableTransparentOnScrollEdge
        tintColor={COLORS.primary}
      >
        <NativeTabs.Trigger name="up-next" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>Watching</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "play.circle", selected: "play.circle.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="upcoming" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>Upcoming</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="calendar" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="discover" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="my-shows" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>My shows</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{
              default: "square.grid.2x2",
              selected: "square.grid.2x2.fill",
            }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
};

export default AppTabs;
