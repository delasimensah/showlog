export const SHOW_STATUSES = [
  "Stopped",
  "Watch later",
  "Not started",
  "Finished",
  "Up to date",
  "Watching",
] as const;

export type ShowStatus = (typeof SHOW_STATUSES)[number];

export interface ShowStatusInput {
  watchedCount: number;
  airedCount: number;
  watchLater: boolean;
  stopped: boolean;
  /** TVmaze show status, such as Running or Ended. */
  tvmazeStatus: string;
}

export function showStatus(input: ShowStatusInput): ShowStatus {
  if (input.stopped) return "Stopped";
  if (input.watchLater) return "Watch later";
  if (input.watchedCount === 0) return "Not started";
  const caughtUp = input.watchedCount >= input.airedCount;
  if (caughtUp && input.tvmazeStatus === "Ended") return "Finished";
  if (caughtUp) return "Up to date";
  return "Watching";
}
