import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";

export function useSearchShows() {
  return useAction(api.search.searchShows);
}
