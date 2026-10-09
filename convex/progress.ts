import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

function hasAired(episode: Doc<"episodes">, now: number): boolean {
  if (episode.airsAt === undefined) return false;
  if (!episode.airTimeKnown) {
    const today = new Date(now);
    const startOfTodayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );
    return episode.airsAt < startOfTodayUtc;
  }
  return episode.airsAt <= now;
}

/**
 * Sets every progress field on a list row from the episodes and ticks.
 * A new show has no ticks, so this sets how many episodes have aired and which one is next.
 */
export async function recomputeProgress(
  ctx: MutationCtx,
  myShowId: Id<"myShows">,
  now: number
): Promise<void> {
  const myShow = await ctx.db.get(myShowId);
  if (myShow === null) throw new Error("Show is not on your list");

  const episodes = await ctx.db
    .query("episodes")
    .withIndex("by_show_order", (q) => q.eq("showId", myShow.showId))
    .collect();
  const ticks = await ctx.db
    .query("watchedEpisodes")
    .withIndex("by_user_show", (q) =>
      q.eq("userId", myShow.userId).eq("showId", myShow.showId)
    )
    .collect();
  const ticked = new Set(ticks.map((tick) => tick.episodeId));
  const aired = episodes.filter((episode) => hasAired(episode, now));
  const next = aired.find((episode) => !ticked.has(episode._id));
  const waitingAfterNext =
    next === undefined
      ? 0
      : aired.filter(
          (episode) => episode.order > next.order && !ticked.has(episode._id)
        ).length;

  let lastTick: Doc<"watchedEpisodes"> | undefined;
  for (const tick of ticks) {
    if (lastTick === undefined || tick.watchedAt > lastTick.watchedAt) {
      lastTick = tick;
    }
  }

  await ctx.db.patch(myShowId, {
    airedCount: aired.length,
    watchedCount: ticks.length,
    waitingAfterNext,
    nextEpisodeId: next?._id,
    lastWatchedAt: lastTick?.watchedAt,
    lastWatchedEpisodeId: lastTick?.episodeId,
  });
}
