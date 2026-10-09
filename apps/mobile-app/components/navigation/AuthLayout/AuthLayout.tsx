import { Redirect, Stack, ThemeProvider } from "expo-router";
import React from "react";

import { COLORS } from "@/constants";
import { useSession } from "@/hooks";
import { defaultStackScreenOptions, navigationTheme } from "@/utils";

import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main-app)/(tabs)/up-next" />;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          ...defaultStackScreenOptions,
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.page },
        }}
      >
        <Stack.Screen name="sign-in" />
      </Stack>
    </ThemeProvider>
  );
};

export default AuthLayout;
