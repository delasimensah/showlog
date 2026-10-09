import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useMutation } from "convex/react";

import { useWatchSeason } from "../useWatchSeason";

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

describe("useWatchSeason", () => {
  it("ticks every aired episode in the season at once", () => {
    let update: (store: ReturnType<typeof memoryStore>) => void = () =>
      undefined;
    mockedUseMutation.mockReturnValue({
      withOptimisticUpdate: (fn: typeof update) => {
        update = fn;
        return jest.fn();
      },
    });

    renderHook(() =>
      useWatchSeason({
        showId: "shows-1" as never,
        season: 1,
        tvmazeId: 1,
      })
    );

    const store = memoryStore();
    store.setQuery(
      api.shows.season,
      { showId: "shows-1", season: 1 },
      {
        episodes: [
          {
            episodeId: "episodes-1",
            season: 1,
            number: 1,
            order: 1,
            name: "One",
            summary: null,
            watched: true,
            aired: true,
          },
          {
            episodeId: "episodes-2",
            season: 1,
            number: 2,
            order: 2,
            name: "Two",
            summary: null,
            watched: false,
            aired: true,
          },
          { episodeId: "episodes-3", order: 3, watched: false, aired: false },
        ],
      }
    );
    store.setQuery(
      api.shows.get,
      { tvmazeId: 1 },
      {
        watchedCount: 1,
        airedCount: 2,
        leftOff: { episodeId: "episodes-1", order: 1, name: "One" },
        upNext: { episodeId: "episodes-2", order: 2, name: "Two" },
        seasons: [{ number: 1, watchedCount: 1, episodeCount: 3 }],
      }
    );

    update(store);

    expect(mockedUseMutation).toHaveBeenCalledWith(api.watching.watchSeason);
    expect(
      store.getQuery(api.shows.season, { showId: "shows-1", season: 1 })
    ).toMatchObject({
      episodes: [
        { episodeId: "episodes-1", watched: true },
        { episodeId: "episodes-2", watched: true },
        { episodeId: "episodes-3", watched: false },
      ],
    });
    expect(store.getQuery(api.shows.get, { tvmazeId: 1 })).toMatchObject({
      watchedCount: 2,
      upNext: null,
      leftOff: { episodeId: "episodes-2", name: "Two" },
      seasons: [{ number: 1, watchedCount: 2 }],
    });
  });
});
