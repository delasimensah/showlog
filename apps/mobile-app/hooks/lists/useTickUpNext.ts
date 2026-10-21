import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

function advance<Row extends { episodeId: string; waitingAfterNext: number }>(
  rows: Row[],
  episodeId: string
) {
  return rows.flatMap((row) => {
    if (row.episodeId !== episodeId) return [row];
    if (row.waitingAfterNext === 0) return [];
    return [{ ...row, waitingAfterNext: row.waitingAfterNext - 1 }];
  });
}

export function useTickUpNext() {
  return useMutation(api.watching.mutations.tick).withOptimisticUpdate(
    (localStore, args) => {
      for (const query of localStore.getAllQueries(api.lists.queries.upNext)) {
        if (query.value === undefined) continue;
        localStore.setQuery(api.lists.queries.upNext, query.args, {
          upNext: advance(query.value.upNext, args.episodeId),
          paused: advance(query.value.paused, args.episodeId),
          notStarted: advance(query.value.notStarted, args.episodeId),
        });
      }
    }
  );
}
