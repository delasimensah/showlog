import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function useAccount() {
  return useQuery(api.profile.queries.account);
}
