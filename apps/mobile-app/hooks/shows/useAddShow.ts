import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";

export function useAddShow() {
  return useAction(api.shows.add);
}
