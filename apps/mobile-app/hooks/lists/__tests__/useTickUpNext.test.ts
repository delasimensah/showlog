import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useMutation } from "convex/react";

import { useTickUpNext } from "../useTickUpNext";

jest.mock("convex/react", () => ({
  useMutation: jest.fn(),
}));

const mockedUseMutation = useMutation as jest.Mock;

function memoryStore() {
  const rows: { args: Record<string, unknown>; value: unknown }[] = [];
  const same = (left: unknown, right: unknown) =>
    JSON.stringify(left) === JSON.stringify(right);
  return {
    getQuery(_query: unknown, args: unknown) {
      return rows.find((row) => same(row.args, args))?.value;
    },
    getAllQueries() {
      return rows.map((row) => ({ args: row.args, value: row.value }));
    },
    setQuery(_query: unknown, args: Record<string, unknown>, value: unknown) {
      const row = rows.find((item) => same(item.args, args));
      if (row) row.value = value;
      else rows.push({ args, value });
    },
  };
}

describe("useTickUpNext", () => {
  it("drops the row when nothing is left after it", () => {
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

    renderHook(() => useTickUpNext());
    const store = memoryStore();
    store.setQuery(
      api.lists.queries.upNext,
      { refreshedAt: 1 },
      {
        upNext: [
          { episodeId: "episodes-1", waitingAfterNext: 0 },
          { episodeId: "episodes-2", waitingAfterNext: 2 },
        ],
        paused: [],
        notStarted: [],
      }
    );

    update(store, { episodeId: "episodes-1" });

    expect(
      store.getQuery(api.lists.queries.upNext, { refreshedAt: 1 })
    ).toMatchObject({
      upNext: [{ episodeId: "episodes-2", waitingAfterNext: 2 }],
    });
  });
});
