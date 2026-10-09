import { Redirect, Stack } from "expo-router";
import React from "react";

import { COLORS } from "@/constants";
import { useSession } from "@/hooks";

import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main-app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.page },
      }}
    >
      <Stack.Screen name="sign-in" />
    </Stack>
  );
};

export default AuthLayout;
