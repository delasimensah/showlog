import { Redirect } from "expo-router";
import React from "react";

import { useSession } from "@/hooks";

import LoadingScreen from "../LoadingScreen/LoadingScreen";

const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main-app)/(tabs)/up-next" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
};

export default AuthGate;
