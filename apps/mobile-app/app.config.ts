import type { ConfigContext, ExpoConfig } from "expo/config";

const ASSET_PATHS = {
  appIcon: "./assets/icons/icon.png",
  iosIcon: "./assets/icons/showlog.icon",
  splashIcon: "./assets/icons/splash-icon.png",
};

const BRAND_COLOR = "#0e0e10";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_STAGING = process.env.APP_VARIANT === "staging";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.dmstudios.showlog.dev";
  }

  if (IS_STAGING) {
    return "com.dmstudios.showlog.staging";
  }

  return "com.dmstudios.showlog";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Showlog(Dev)";
  }

  if (IS_STAGING) {
    return "Showlog(Staging)";
  }

  return "Showlog";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "showlog",
  version: "1.0.0",
  icon: ASSET_PATHS.appIcon,
  orientation: "portrait",
  scheme: "showlog",
  userInterfaceStyle: "dark",
  backgroundColor: BRAND_COLOR,
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
    icon: ASSET_PATHS.iosIcon,
    supportsTablet: false,
    infoPlist: {
      ...config.ios?.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-image",
    "expo-sharing",
    [
      "expo-notifications",
      {
        enableBackgroundRemoteNotifications: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: BRAND_COLOR,
        image: ASSET_PATHS.splashIcon,
        imageWidth: 200,
        resizeMode: "contain",
        dark: {
          backgroundColor: BRAND_COLOR,
          image: ASSET_PATHS.splashIcon,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    router: {},
  },
  owner: "dm-studios",
});
