import { DarkTheme } from "expo-router";

import { COLORS, FONTS } from "@/constants";

/**
 * Default screen options for Stack navigator
 * Provides consistent styling across all screens
 */
/** The default navigator theme is light, so the glass bar samples white. */
export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.page,
    card: COLORS.page,
    text: COLORS.text,
    border: COLORS.surface,
    notification: COLORS.danger,
  },
};

/**
 * The iPhone draws the navigation bar, including its back button, in liquid glass.
 * A solid header background replaces that glass, so this leaves the bar alone.
 * https://docs.expo.dev/router/advanced/stack/
 */
export const defaultStackScreenOptions = {
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal" as const,
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  contentStyle: {
    backgroundColor: COLORS.page,
  },
};

/** Same glass bar and large title on every tab. */
export const tabStackScreenOptions = {
  ...defaultStackScreenOptions,
  headerShown: true,
  headerLargeTitleEnabled: true,
  headerLargeTitleStyle: {
    color: COLORS.text,
    fontFamily: FONTS.extrabold,
  },
};

/**
 * Common screen option presets
 * Use these for consistent screen configurations
 */
export const screenPresets = {
  /**
   * Hide the header for nested navigators
   */
  noHeader: {
    headerShown: false,
  },

  /**
   * Modal presentation style
   */
  modal: {
    presentation: "modal" as const,
  },

  /**
   * Full screen modal
   */
  fullScreenModal: {
    presentation: "fullScreenModal" as const,
  },

  /**
   * Transparent modal
   */
  transparentModal: {
    presentation: "transparentModal" as const,
  },

  /**
   * Transparent header with no title
   */
  transparentHeader: {
    headerTransparent: true,
    headerTitle: "",
    headerStyle: {
      backgroundColor: "transparent",
    },
  },
};
