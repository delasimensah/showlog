import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

export function useSetWatchLater() {
  return useMutation(api.shows.setWatchLater);
}

export function useStopShow() {
  return useMutation(api.shows.stop);
}

export function useResumeShow() {
  return useMutation(api.shows.resume);
}

export function useRemoveShow() {
  return useMutation(api.shows.remove);
}
