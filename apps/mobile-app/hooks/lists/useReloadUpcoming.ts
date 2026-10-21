import { api } from "@convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback } from "react";

export function useReloadUpcoming() {
  const convex = useConvex();

  return useCallback(
    (stamp: number) => convex.query(api.lists.queries.upcoming, { now: stamp }),
    [convex]
  );
}
