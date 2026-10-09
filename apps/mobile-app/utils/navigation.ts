import { DarkTheme } from "expo-router";

import { COLORS } from "@/constants";

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

export const defaultStackScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.page,
  },
  headerTintColor: "white",
  headerTitleStyle: {
    fontFamily: "App-Regular",
  },
  contentStyle: {
    backgroundColor: COLORS.page,
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
