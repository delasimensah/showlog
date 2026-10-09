import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useProfileStats() {
  return useQuery(api.profile.stats, {});
}
