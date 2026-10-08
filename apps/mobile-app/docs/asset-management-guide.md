# 🎨 Asset Management Guide

> **Purpose**: Guide for managing colors, fonts, and assets in the mobile app.

## 🚀 Quick Start

> **For New Developers**: This guide shows you how to add images, fonts, and colors to the app. Each asset type follows a simple pattern: add file → update constants → use in components.

### **📋 Quick Reference**

- **Images** — `assets/images/`; constants in `constants/assets.ts`; usage: `<Image source={ASSETS.images.name} />`
- **Icons** — `assets/icons/`; constants in `constants/assets.ts`; usage: `<Image source={ASSETS.icons.name} />`
- **Videos** — `assets/videos/`; constants in `constants/assets.ts`; usage: `<Video source={ASSETS.videos.name} />`
- **Fonts** — `@expo-google-fonts/plus-jakarta-sans`; names in `constants/fonts.ts`, files in `constants/fontLoadingMap.ts`; usage: `className="font-app-bold"`
- **Colours** — `packages/shared/src/constants/colors.ts`; usage: `className="bg-page"`

## 🚨 **CRITICAL: Image Component Requirements**

> **⚠️ MANDATORY**: ALL images in the mobile app MUST use `expo-image`, NEVER `react-native` Image components.
>
> **✅ CORRECT**: `import { Image } from "expo-image"`
> **❌ WRONG**: `import { Image } from "react-native"`
>
> **Consequence**: PR will be rejected if `react-native` Image is used anywhere in the codebase.

### **Adding a New Image**

**Step 1: Add Image File to Assets**

```bash
# Add your image file to the appropriate assets folder
assets/images/new-image.png
assets/icons/new-icon.png
assets/videos/new-video.mp4
```

**Step 2: Update Constants (constants/assets.ts)**

```typescript
// Add to the appropriate category in ASSETS
export const ASSETS = {
  images: {
    // ... existing images
    newImage: require("../assets/images/new-image.png"),
  },
  icons: {
    // ... existing icons
    newIcon: require("../assets/icons/new-icon.png"),
  },
  videos: {
    // ... existing videos
    newVideo: require("../assets/videos/new-video.mp4"),
  },
} as const;
```

**Step 3: Use in Components**

```typescript
// Option A: Using expo-image Image component
import { Image } from "expo-image";
import { ASSETS } from "@/constants";

<Image source={ASSETS.images.newImage} />

// Option B: With styling
<Image
  source={ASSETS.images.newImage}
  style={{ width: 300, height: 200 }}
  contentFit="cover"
/>
```

> ⚠️ **Important**: `expo-image` does NOT support `className` prop. Use inline styles.

**Step 4: Expo Image Styling**

**expo-image requires inline styles (not Tailwind classes):**

```typescript
// ✅ Correct - expo-image with inline styles
import { Image } from "expo-image";
<Image
  source={ASSETS.images.appIcon}
  style={{ width: 32, height: 32, borderRadius: 16 }}
  contentFit="cover"
/>

// ❌ Wrong - className does NOT work on expo-image
<Image
  source={ASSETS.images.appIcon}
  className="h-8 w-8 rounded-2xl"
  contentFit="cover"
/>
```

**Why expo-image?**

- Better performance than React Native Image
- Built-in caching and placeholder support
- Modern features (blurhash, priority loading)

**Step 5: For app.config.ts (if needed)**

> ⚠️ **Important**: `app.config.ts` runs in Node.js context and cannot import from constants. Use direct string paths.

```typescript
// app.config.ts - Use direct string paths (cannot import constants)
const ASSET_PATHS = {
  // ... existing paths
  newImage: "./assets/images/new-image.png",
} as const;

// Use in app config
icon: ASSET_PATHS.newImage;
```

### **Fonts**

The app uses one family, **Plus Jakarta Sans**, from `@expo-google-fonts/plus-jakarta-sans`. The choice and sizes are locked in `docs/design/design-system.md`.

- `constants/fonts.ts` — `FONTS`, the generic family names (`App-Regular`, `App-Medium`, `App-SemiBold`, `App-Bold`, `App-ExtraBold`). Tailwind reads this file.
- `constants/fontLoadingMap.ts` — `FONT_LOADING_MAP`, which maps each name to its font file. `app/_layout.tsx` loads it with `useFonts`.

Use the Tailwind classes in components:

```tsx
<Text className="font-app-extrabold text-[34px]">Up next</Text>
<Text className="font-app-semibold text-[13px] text-primary">S4 | E11</Text>
```

Use `FONTS` only where a class cannot reach, such as navigation options:

```tsx
<Stack screenOptions={{ headerTitleStyle: { fontFamily: FONTS.bold } }} />
```

To add a weight: import it in `fontLoadingMap.ts`, add a name to `FONTS`, and add the `font-app-*` class in `tailwind.config.js`.

### **Colours**

Colours live in `packages/shared/src/constants/colors.ts` and are locked in `docs/design/design-system.md`. The app re-exports them from `@/constants`, and `tailwind.config.js` turns each one into a class.

The tokens: `page`, `surface`, `border`, `text`, `muted`, `primary`, `onPrimary`, `danger`.

```tsx
<VStack className="bg-page" />
<Text className="text-muted" />
<Button variant="quietDanger" text="Remove from my list" />
```

Use `COLORS` only where a class cannot reach:

```tsx
<Ionicons name="checkmark" size={20} color={COLORS.primary} />
```

Never write a hex value in a component. A new colour goes into the design system first, then `colors.ts`, then `tailwind.config.js`.

## 📁 Asset Organization

```
assets/
├── icons/        # icon.png, splash-icon.png, the iOS .icon folder
└── images/       # in-app images, if any
```

Show posters are not assets. They load from TVmaze URLs with `expo-image`.

## 🚨 Troubleshooting

- **Font not showing:** check the name is in `FONTS` and in `FONT_LOADING_MAP`, and that the class exists in `tailwind.config.js`. Restart Metro with `--clear` after changing the Tailwind config.
- **Colour class does nothing:** check the token is in `colors.ts` and in `tailwind.config.js`, then restart Metro with `--clear`.
- **Image not loading:** check the `require` path in `constants/assets.ts` and that the file exists.

## 📚 Related Documentation

- `docs/design/design-system.md` (repo root)
- [Project structure](./project-structure.md)
