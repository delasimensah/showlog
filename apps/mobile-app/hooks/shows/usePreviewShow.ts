import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";

export function usePreviewShow() {
  return useAction(api.shows.actions.preview);
}
