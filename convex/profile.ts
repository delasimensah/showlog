import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedQuery } from "./lib/functions";

export const account = authedQuery({
  args: {},
  returns: v.object({
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const user = await ctx.db.get(ctx.userId);
    return {
      name: user?.name ?? null,
      email: user?.email ?? null,
    };
  },
});

export const stats = authedQuery({
  args: {},
  returns: v.object({
    episodesWatched: v.number(),
    minutesWatched: v.number(),
  }),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .unique();
    return {
      episodesWatched: row?.episodesWatched ?? 0,
      minutesWatched: row?.minutesWatched ?? 0,
    };
  },
});

async function everyPage<T>(
  load: (cursor: string | null) => Promise<{
    page: T[];
    continueCursor: string;
    isDone: boolean;
  }>
): Promise<T[]> {
  const rows: T[] = [];
  let cursor: string | null = null;
  for (;;) {
    const result = await load(cursor);
    rows.push(...result.page);
    if (result.isDone) return rows;
    cursor = result.continueCursor;
  }
}

export const exportHistory = action({
  args: {},
  returns: v.string(),
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) raise(ERROR_CODES.UNAUTHENTICATED);
    const id = userId as Id<"users">;
    const shows: {
      name: string;
      addedAt: number;
      status: string;
    }[] = await everyPage((cursor) =>
      ctx.runQuery(internal.history.showsPage, { userId: id, cursor })
    );
    const episodes: {
      show: string;
      season: number;
      number: number;
      title: string;
      watchedAt: number;
    }[] = await everyPage((cursor) =>
      ctx.runQuery(internal.history.episodesPage, { userId: id, cursor })
    );
    return JSON.stringify({ shows, episodes });
  },
});
