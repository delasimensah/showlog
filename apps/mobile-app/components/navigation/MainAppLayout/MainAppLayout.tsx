import { Redirect, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

import { COLORS } from "@/constants";
import { useSession } from "@/hooks";
import { defaultStackScreenOptions, navigationTheme } from "@/utils";

import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";

const MainAppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <>
      <StatusBar style="light" />
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            ...defaultStackScreenOptions,
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.page },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="profile"
            options={{ headerShown: true, title: "Profile" }}
          />
          <Stack.Screen
            name="search"
            options={{
              headerShown: true,
              title: "",
              headerBackVisible: false,
            }}
          />
          {/* The show is a screen of this stack, so the system back button can return. */}
          <Stack.Screen
            name="show/[tvmazeId]"
            options={{
              headerShown: true,
              headerTransparent: true,
              title: "",
              scrollEdgeEffects: { top: "hidden" },
            }}
          />
          <Stack.Screen
            name="show/[tvmazeId]/season/[season]"
            options={{ headerShown: true, title: "" }}
          />
        </Stack>
      </ThemeProvider>
    </>
  );
};

export default MainAppLayout;
