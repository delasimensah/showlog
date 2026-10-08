import { ConvexReactClient } from "convex/react";

export function createConvexClient(): ConvexReactClient {
  const url = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_CONVEX_URL is not set. Run `yarn dev:backend` once from the repo root, then copy the URL into apps/mobile-app/.env.local."
    );
  }

  return new ConvexReactClient(url, {
    unsavedChangesWarning: false,
  });
}
