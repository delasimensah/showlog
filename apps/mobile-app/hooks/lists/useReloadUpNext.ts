import { api } from "@convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback } from "react";

export function useReloadUpNext() {
  const convex = useConvex();

  return useCallback(
    (stamp: number) =>
      convex.query(api.lists.queries.upNext, { refreshedAt: stamp }),
    [convex]
  );
}
