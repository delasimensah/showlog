import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useMutation } from "convex/react";

import { useTickUpNext } from "../useTickUpNext";

jest.mock("convex/react", () => ({
  useMutation: jest.fn(),
}));

const mockedUseMutation = useMutation as jest.Mock;

function memoryStore() {
  const rows: { args: string; value: unknown }[] = [];
  return {
    getQuery(_query: unknown, args: unknown) {
      return rows.find((row) => row.args === JSON.stringify(args))?.value;
    },
    setQuery(_query: unknown, args: unknown, value: unknown) {
      const key = JSON.stringify(args);
      const row = rows.find((item) => item.args === key);
      if (row) row.value = value;
      else rows.push({ args: key, value });
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
      api.lists.upNext,
      {},
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

    expect(store.getQuery(api.lists.upNext, {})).toMatchObject({
      upNext: [{ episodeId: "episodes-2", waitingAfterNext: 2 }],
    });
  });
});
