import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { toPoolShows } from "../lib/discoverPool";
import { fetchJson } from "../lib/tvmaze";

const PAGES_PER_RUN = 15;
const NEXT_PAGE_MS = 10_000;

function isMissingPage(error: unknown): boolean {
  return error instanceof Error && error.message.includes("(404)");
}

export const refreshPool = internalAction({
  args: {
    page: v.optional(v.number()),
    refreshId: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const refreshId = args.refreshId ?? Date.now();
    let page = args.page ?? 0;

    for (let index = 0; index < PAGES_PER_RUN; index += 1) {
      let payload: unknown;
      try {
        payload = await fetchJson(`/shows?page=${page}`);
      } catch (error) {
        if (!isMissingPage(error)) throw error;
        await ctx.runMutation(internal.discover.mutations.dropStale, {
          refreshId,
        });
        return null;
      }
      const suggestions = toPoolShows(payload, refreshId);
      if (suggestions.length > 0) {
        await ctx.runMutation(internal.discover.mutations.upsertSuggestions, {
          suggestions,
        });
      }
      page += 1;
    }

    await ctx.scheduler.runAfter(
      NEXT_PAGE_MS,
      internal.discover.actions.refreshPool,
      {
        page,
        refreshId,
      }
    );
    return null;
  },
});
