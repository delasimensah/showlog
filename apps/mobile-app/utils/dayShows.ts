import { pickFromPool } from "./pickFromPool";

const ROW_SIZE = 20;

/** Local calendar day, so the row stays put until tomorrow. */
export function localDay(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${date}`;
}

function seedForDay(day: string): number {
  let hash = 2166136261;
  for (let index = 0; index < day.length; index += 1) {
    hash ^= day.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Keeps today's posters in place. A later server update can fill an empty
 * slot, and tomorrow starts a new pick. Scrolling does not change the row.
 */
export function keepDayShows<T extends { tvmazeId: number }>(
  previous: readonly T[] | undefined,
  shows: readonly T[],
  day: string
): T[] {
  const byId = new Map(shows.map((show) => [show.tvmazeId, show]));
  const next: T[] = [];
  if (previous !== undefined) {
    for (const show of previous) {
      const fresh = byId.get(show.tvmazeId);
      if (fresh !== undefined) next.push(fresh);
    }
  }
  if (next.length < ROW_SIZE) {
    const used = new Set(next.map((show) => show.tvmazeId));
    const rest = shows.filter((show) => !used.has(show.tvmazeId));
    for (const show of pickFromPool(rest, seedForDay(day))) {
      if (next.length >= ROW_SIZE) break;
      next.push(show);
    }
  }
  const picked = next.slice(0, ROW_SIZE);
  if (
    previous !== undefined &&
    picked.length === previous.length &&
    picked.every((show, index) => show.tvmazeId === previous[index]?.tvmazeId)
  ) {
    return previous as T[];
  }
  return picked;
}
