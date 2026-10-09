import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ASSETS, COLORS } from "@/constants";

import SignInForm from "../../../auth/SignInForm/SignInForm";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const SignInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: COLORS.page,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style="light" />
      <VStack
        spacing="lg"
        align="center"
        justify="center"
        className="flex-1 px-5"
      >
        <Image
          source={ASSETS.icons.appIcon}
          accessibilityLabel="Showlog"
          style={{ width: 72, height: 72 }}
          contentFit="contain"
        />
        <Text className="text-center font-app-medium text-[15px] text-muted">
          Track the shows you watch.
        </Text>
        <SignInForm />
      </VStack>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
