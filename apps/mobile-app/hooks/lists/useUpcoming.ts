import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useUpcoming(now: number) {
  return useQuery(api.lists.queries.upcoming, { now });
}
