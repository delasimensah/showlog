import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";

export function useExportHistory() {
  return useAction(api.profile.actions.exportHistory);
}
