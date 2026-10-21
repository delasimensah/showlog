import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useUpNext(refreshedAt?: number) {
  return useQuery(
    api.lists.queries.upNext,
    refreshedAt === undefined ? {} : { refreshedAt }
  );
}
