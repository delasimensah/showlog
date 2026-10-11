import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useShow(tvmazeId: number) {
  return useQuery(api.shows.queries.get, { tvmazeId });
}
