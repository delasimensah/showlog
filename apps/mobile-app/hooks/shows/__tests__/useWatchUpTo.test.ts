import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useMutation } from "convex/react";

import { useWatchUpTo } from "../useWatchUpTo";

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

describe("useWatchUpTo", () => {
  it("ticks this episode and every earlier aired one in the season at once", () => {
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
      useWatchUpTo({
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
        episodes: [
          {
            episodeId: "episodes-1",
            season: 1,
            number: 1,
            order: 1,
            name: "One",
            summary: null,
            watched: false,
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
          {
            episodeId: "episodes-3",
            season: 1,
            number: 3,
            order: 3,
            name: "Three",
            summary: null,
            watched: false,
            aired: true,
          },
        ],
      }
    );
    store.setQuery(
      api.shows.queries.get,
      { tvmazeId: 1 },
      {
        watchedCount: 0,
        airedCount: 3,
        leftOff: null,
        upNext: { episodeId: "episodes-1", order: 1, name: "One" },
        seasons: [{ number: 1, watchedCount: 0, episodeCount: 3 }],
      }
    );

    update(store, { episodeId: "episodes-2" });

    expect(mockedUseMutation).toHaveBeenCalledWith(
      api.watching.mutations.watchUpTo
    );
    expect(
      store.getQuery(api.shows.queries.season, { showId: "shows-1", season: 1 })
    ).toMatchObject({
      episodes: [
        { episodeId: "episodes-1", watched: true },
        { episodeId: "episodes-2", watched: true },
        { episodeId: "episodes-3", watched: false },
      ],
    });
    expect(
      store.getQuery(api.shows.queries.get, { tvmazeId: 1 })
    ).toMatchObject({
      watchedCount: 2,
      upNext: null,
      leftOff: { episodeId: "episodes-2", name: "Two" },
    });
  });
});
