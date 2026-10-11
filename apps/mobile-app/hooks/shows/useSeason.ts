import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useSeason(showId: Id<"shows"> | undefined, season: number) {
  return useQuery(
    api.shows.queries.season,
    showId === undefined ? "skip" : { showId, season }
  );
}
