require("ts-node").register({
  transpileOnly: true,
  skipProject: true,
  compilerOptions: {
    module: "node16",
    moduleResolution: "node16",
    target: "es2020",
    esModuleInterop: true,
    skipLibCheck: true,
  },
});

const { COLORS } = require("../../packages/shared/src/constants");
const { FONTS } = require("./constants/fonts.ts");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        page: COLORS.page,
        surface: COLORS.surface,
        border: COLORS.border,
        text: COLORS.text,
        muted: COLORS.muted,
        primary: COLORS.primary,
        onPrimary: COLORS.onPrimary,
        later: COLORS.later,
        danger: COLORS.danger,
      },
      fontFamily: {
        "app-regular": [FONTS.regular],
        "app-medium": [FONTS.medium],
        "app-semibold": [FONTS.semibold],
        "app-bold": [FONTS.bold],
        "app-extrabold": [FONTS.extrabold],
      },
    },
  },
  plugins: [],
};
