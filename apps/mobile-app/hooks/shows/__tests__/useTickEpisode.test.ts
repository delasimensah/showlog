import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useMutation } from "convex/react";

import { useTickEpisode } from "../useTickEpisode";

jest.mock("convex/react", () => ({
  useMutation: jest.fn(),
}));

const mockedUseMutation = useMutation as jest.Mock;

function memoryStore() {
  const rows: { query: unknown; args: string; value: unknown }[] = [];
  return {
    getQuery(_query: unknown, args: unknown) {
      return rows.find((row) => row.args === JSON.stringify(args))?.value;
    },
    setQuery(query: unknown, args: unknown, value: unknown) {
      const key = JSON.stringify(args);
      const row = rows.find((item) => item.args === key);
      if (row) row.value = value;
      else rows.push({ query, args: key, value });
    },
  };
}

describe("useTickEpisode", () => {
  it("fills the tick on the season and the show at once", () => {
    let update: (
      store: ReturnType<typeof memoryStore>,
      args: { episodeId: string }
    ) => void = () => undefined;
    mockedUseMutation.mockReturnValue({
      withOptimisticUpdate: (fn: typeof update) => {
        update = fn;
        return jest.fn();
      },
    });

    renderHook(() =>
      useTickEpisode({
        showId: "shows-1" as never,
        season: 1,
        tvmazeId: 1,
      })
    );

    const store = memoryStore();
    store.setQuery(
      api.shows.queries.season,
      { showId: "shows-1", season: 1 },
      {
        episodes: [{ episodeId: "episodes-1", watched: false, aired: true }],
      }
    );
    store.setQuery(
      api.shows.queries.get,
      { tvmazeId: 1 },
      {
        watchedCount: 0,
        seasons: [{ number: 1, watchedCount: 0, episodeCount: 2 }],
      }
    );

    update(store, { episodeId: "episodes-1" });

    expect(mockedUseMutation).toHaveBeenCalledWith(api.watching.mutations.tick);
    expect(
      store.getQuery(api.shows.queries.season, { showId: "shows-1", season: 1 })
    ).toMatchObject({
      episodes: [{ episodeId: "episodes-1", watched: true }],
    });
    expect(
      store.getQuery(api.shows.queries.get, { tvmazeId: 1 })
    ).toMatchObject({
      watchedCount: 1,
      seasons: [{ number: 1, watchedCount: 1 }],
    });
  });
});
