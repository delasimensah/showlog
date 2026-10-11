import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

export function useSetWatchLater() {
  return useMutation(api.shows.mutations.setWatchLater);
}

export function useStopShow() {
  return useMutation(api.shows.mutations.stop);
}

export function useResumeShow() {
  return useMutation(api.shows.mutations.resume);
}

export function useRemoveShow() {
  return useMutation(api.shows.mutations.remove);
}
