import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

/** The TVmaze ids on my list. Stays current while the screen is open. */
export function useListedShows() {
  return useQuery(api.lists.queries.myTvmazeIds, {});
}
