import { v } from "convex/values";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import { copiesFromShowPayload, fetchJson } from "../lib/tvmaze";

function updatedShowIds(payload: unknown): number[] {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return [];
  }
  const ids: number[] = [];
  for (const key of Object.keys(payload)) {
    const id = Number(key);
    if (Number.isInteger(id) && id > 0) ids.push(id);
  }
  return ids;
}

/**
 * Steps 1 to 3 of the daily refresh. A premiere alert is added in a later ticket.
 * Only shows TVmaze changed today are fetched again. The rest stay as they are.
 */
export const daily = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const updates = await fetchJson("/updates/shows?since=day");
    const shows: Array<{ showId: Id<"shows">; tvmazeId: number }> =
      await ctx.runQuery(internal.refresh.queries.showsToRefresh, {
        tvmazeIds: updatedShowIds(updates),
      });

    for (const row of shows) {
      const payload = await fetchJson(
        `/shows/${row.tvmazeId}?embed[]=episodes&embed[]=images`
      );
      const { show, episodes } = copiesFromShowPayload(payload);
      if (show.tvmazeId !== row.tvmazeId) {
        throw new Error("TVmaze returned a different show");
      }
      await ctx.runMutation(internal.refresh.mutations.apply, {
        showId: row.showId,
        show,
        episodes,
      });
    }
    return null;
  },
});
