import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

async function orderOf(
  ctx: MutationCtx,
  episodeId: Id<"episodes"> | undefined
): Promise<number | null> {
  if (episodeId === undefined) return null;
  return (await ctx.db.get(episodeId))?.order ?? null;
}

async function tickOf(
  ctx: MutationCtx,
  userId: Id<"users">,
  episodeId: Id<"episodes">
) {
  return await ctx.db
    .query("watchedEpisodes")
    .withIndex("by_user_episode", (q) =>
      q.eq("userId", userId).eq("episodeId", episodeId)
    )
    .unique();
}

/**
 * The first aired, un-ticked episode after `afterOrder`. The query is read
 * lazily and stops at the first match, so watching in order reads one episode.
 */
async function nextAfter(
  ctx: MutationCtx,
  myShow: Doc<"myShows">,
  afterOrder: number,
  now: number
): Promise<Id<"episodes"> | undefined> {
  for await (const episode of ctx.db
    .query("episodes")
    .withIndex("by_show_order", (q) =>
      q.eq("showId", myShow.showId).gt("order", afterOrder)
    )) {
    if (!hasAired(episode, now)) continue;
    if ((await tickOf(ctx, myShow.userId, episode._id)) === null) {
      return episode._id;
    }
  }
  return undefined;
}

/**
 * The furthest ticked episode before `beforeOrder`, found by walking back
 * from it and stopping at the first tick.
 */
async function lastTickBefore(
  ctx: MutationCtx,
  myShow: Doc<"myShows">,
  beforeOrder: number
) {
  for await (const episode of ctx.db
    .query("episodes")
    .withIndex("by_show_order", (q) =>
      q.eq("showId", myShow.showId).lt("order", beforeOrder)
    )
    .order("desc")) {
    const tick = await tickOf(ctx, myShow.userId, episode._id);
    if (tick !== null)
      return { episodeId: episode._id, watchedAt: tick.watchedAt };
  }
  return null;
}

export function startOfUtcDay(now: number): number {
  const day = new Date(now);
  return Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
}

export function hasAired(episode: Doc<"episodes">, now: number): boolean {
  if (episode.airsAt === undefined) return false;
  if (!episode.airTimeKnown) return episode.airsAt < startOfUtcDay(now);
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

  // Furthest ticked episode. A shared watch time would otherwise stay on the first tick.
  const orderOf = new Map(
    episodes.map((episode) => [episode._id, episode.order])
  );
  let lastTick: Doc<"watchedEpisodes"> | undefined;
  for (const tick of ticks) {
    if (lastTick === undefined) {
      lastTick = tick;
      continue;
    }
    const tickOrder = orderOf.get(tick.episodeId) ?? 0;
    const lastOrder = orderOf.get(lastTick.episodeId) ?? 0;
    if (tickOrder > lastOrder) lastTick = tick;
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

/**
 * Updates the progress fields after one new tick without reading the whole show.
 * Every tick is for an aired episode, so the episodes still waiting are the
 * aired ones minus the ticked ones, and all but the next one come after it.
 * Falls back to a full recompute when the row is out of step with the ticks.
 */
export async function tickProgress(
  ctx: MutationCtx,
  myShow: Doc<"myShows">,
  episode: Doc<"episodes">,
  watchedAt: number,
  now: number
): Promise<void> {
  const watchedCount = myShow.watchedCount + 1;
  const nextOrder = await orderOf(ctx, myShow.nextEpisodeId);
  if (
    nextOrder === null ||
    episode.order < nextOrder ||
    watchedCount > myShow.airedCount
  ) {
    await recomputeProgress(ctx, myShow._id, now);
    return;
  }

  const nextEpisodeId =
    episode._id === myShow.nextEpisodeId
      ? await nextAfter(ctx, myShow, episode.order, now)
      : myShow.nextEpisodeId;

  const lastOrder = await orderOf(ctx, myShow.lastWatchedEpisodeId);
  const isFurthest = lastOrder === null || episode.order > lastOrder;

  await ctx.db.patch(myShow._id, {
    watchedCount,
    waitingAfterNext:
      nextEpisodeId === undefined ? 0 : myShow.airedCount - watchedCount - 1,
    nextEpisodeId,
    lastWatchedAt: isFurthest ? watchedAt : myShow.lastWatchedAt,
    lastWatchedEpisodeId: isFurthest
      ? episode._id
      : myShow.lastWatchedEpisodeId,
  });
}

/** The same as `tickProgress`, for a tick that was just removed. */
export async function untickProgress(
  ctx: MutationCtx,
  myShow: Doc<"myShows">,
  episode: Doc<"episodes">,
  now: number
): Promise<void> {
  const watchedCount = myShow.watchedCount - 1;
  if (watchedCount < 0 || !hasAired(episode, now)) {
    await recomputeProgress(ctx, myShow._id, now);
    return;
  }

  const nextOrder = await orderOf(ctx, myShow.nextEpisodeId);
  const nextEpisodeId =
    nextOrder === null || episode.order < nextOrder
      ? episode._id
      : myShow.nextEpisodeId;

  let lastWatchedAt = myShow.lastWatchedAt;
  let lastWatchedEpisodeId = myShow.lastWatchedEpisodeId;
  if (episode._id === myShow.lastWatchedEpisodeId) {
    const earlier = await lastTickBefore(ctx, myShow, episode.order);
    lastWatchedAt = earlier?.watchedAt;
    lastWatchedEpisodeId = earlier?.episodeId;
  }

  await ctx.db.patch(myShow._id, {
    watchedCount,
    waitingAfterNext: Math.max(0, myShow.airedCount - watchedCount - 1),
    nextEpisodeId,
    lastWatchedAt,
    lastWatchedEpisodeId,
  });
}
