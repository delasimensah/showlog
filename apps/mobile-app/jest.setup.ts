(process.env as { NODE_ENV?: string }).NODE_ENV = "test";

jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const extra = require("./test-utils/expoRouterMock");

  return {
    useNavigation: jest.fn(() => ({
      setOptions: jest.fn(),
    })),
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    })),
    Href: {},
    Link: "Link",
    Redirect: extra.Redirect,
    Stack: extra.Stack,
    Tabs: extra.Tabs,
    DarkTheme: {
      dark: true,
      colors: {
        primary: "#000000",
        background: "#000000",
        card: "#000000",
        text: "#ffffff",
        border: "#333333",
        notification: "#ff0000",
      },
      fonts: {
        regular: { fontFamily: "System", fontWeight: "400" },
        medium: { fontFamily: "System", fontWeight: "500" },
        bold: { fontFamily: "System", fontWeight: "600" },
        heavy: { fontFamily: "System", fontWeight: "700" },
      },
    },
    ThemeProvider: ({ children }: { children: unknown }) => children,
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    },
  };
});

jest.mock("expo-router/unstable-native-tabs", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const extra = require("./test-utils/expoRouterMock");

  return {
    NativeTabs: extra.NativeTabs,
  };
});

jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual("react-native-gesture-handler");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, TouchableOpacity } = require("react-native");
  return {
    ...actual,
    GestureHandlerRootView: View,
    TouchableOpacity,
  };
});

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.useReducedMotion = () => false;
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  const MockIcon = (props: { name?: string }) =>
    mockReact.createElement("Text", props, props.name);

  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});

jest.mock("expo-linear-gradient", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  return {
    LinearGradient: ({ children }: { children?: unknown }) =>
      mockReact.createElement("View", null, children),
  };
});

jest.mock("expo-image", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  return {
    Image: (props: Record<string, unknown>) =>
      mockReact.createElement("Image", props),
    ImageBackground: ({ children }: { children?: unknown }) =>
      mockReact.createElement("View", null, children),
  };
});

jest.mock("expo-updates", () => ({
  isEnabled: false,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

jest.mock("@expo/ui/community/menu", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  return {
    MenuView: ({ children }: { children?: unknown }) =>
      mockReact.createElement(mockReact.Fragment, null, children),
  };
});
