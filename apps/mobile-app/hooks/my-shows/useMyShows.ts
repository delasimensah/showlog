import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

import type { MyShowsSort } from "./useMyShowsChoice";

export function useMyShows(sort: MyShowsSort) {
  return useQuery(api.lists.myShows, { sort });
}
