import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";

import { FONTS } from "./fonts";

export const FONT_LOADING_MAP = {
  [FONTS.regular]: PlusJakartaSans_400Regular,
  [FONTS.medium]: PlusJakartaSans_500Medium,
  [FONTS.semibold]: PlusJakartaSans_600SemiBold,
  [FONTS.bold]: PlusJakartaSans_700Bold,
  [FONTS.extrabold]: PlusJakartaSans_800ExtraBold,
} as const;
