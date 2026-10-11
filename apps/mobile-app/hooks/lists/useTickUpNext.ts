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
      const list = localStore.getQuery(api.lists.queries.upNext, {});
      if (list === undefined) return;
      localStore.setQuery(
        api.lists.queries.upNext,
        {},
        {
          upNext: advance(list.upNext, args.episodeId),
          paused: advance(list.paused, args.episodeId),
          notStarted: advance(list.notStarted, args.episodeId),
        }
      );
    }
  );
}
