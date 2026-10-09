import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

import { COLORS } from "@/constants";
import { useSession } from "@/hooks";

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
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.page },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
};

export default MainAppLayout;
