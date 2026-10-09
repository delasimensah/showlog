import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useDiscoverRows() {
  return useQuery(api.discover.rows, {});
}
