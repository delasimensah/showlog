import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useUpNext() {
  return useQuery(api.lists.queries.upNext, {});
}
