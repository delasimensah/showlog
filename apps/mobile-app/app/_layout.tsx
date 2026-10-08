import "react-native-reanimated";
import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import {
  ActiveToast,
  AppProviders,
  BottomSheetsManager,
  ErrorToast,
  LoadingScreen,
  NeutralToast,
  SuccessToast,
} from "@/components";
import { FONT_LOADING_MAP } from "@/constants";
import { defaultStackScreenOptions, screenPresets } from "@/utils";

cssInterop(Image, { className: "style" });
cssInterop(ImageBackground, { className: "style" });
cssInterop(LinearGradient, { className: "style" });

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    ...FONT_LOADING_MAP,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AppProviders>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                ...defaultStackScreenOptions,
                ...screenPresets.noHeader,
              }}
            >
              <Stack.Screen name="index" />
            </Stack>
            <BottomSheetsManager />
            <Toast
              config={{
                active: (props) => <ActiveToast {...props} />,
                neutral: (props) => <NeutralToast {...props} />,
                success: (props) => <SuccessToast {...props} />,
                error: (props) => <ErrorToast {...props} />,
              }}
            />
          </BottomSheetModalProvider>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
