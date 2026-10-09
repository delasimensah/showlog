import "react-native-reanimated";
import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, ThemeProvider } from "expo-router";
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
import { COLORS, FONT_LOADING_MAP } from "@/constants";
import { useApplyAvailableUpdate } from "@/hooks";
import {
  defaultStackScreenOptions,
  navigationTheme,
  screenPresets,
} from "@/utils";

cssInterop(Image, { className: "style" });
cssInterop(ImageBackground, { className: "style" });
cssInterop(LinearGradient, { className: "style" });

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    ...FONT_LOADING_MAP,
  });
  const isCheckingUpdate = useApplyAvailableUpdate();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !isCheckingUpdate) {
      void SplashScreen.hideAsync();
    }
  }, [isCheckingUpdate, loaded]);

  if (!loaded || isCheckingUpdate) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
    >
      <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.page }}>
        <ThemeProvider value={navigationTheme}>
          <AppProviders>
            <BottomSheetModalProvider>
              <Stack
                screenOptions={{
                  ...defaultStackScreenOptions,
                  ...screenPresets.noHeader,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main-app)" />
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
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
