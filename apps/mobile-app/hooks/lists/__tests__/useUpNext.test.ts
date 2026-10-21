import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useUpNext } from "../useUpNext";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useUpNext", () => {
  it("loads the three sections", () => {
    const list = { upNext: [], paused: [], notStarted: [] };
    mockedUseQuery.mockReturnValue(list);

    const { result, rerender } = renderHook(
      ({ refreshedAt }: { refreshedAt?: number }) => useUpNext(refreshedAt),
      { initialProps: {} }
    );

    expect(mockedUseQuery).toHaveBeenCalledWith(api.lists.queries.upNext, {});
    expect(result.current).toBe(list);

    rerender({ refreshedAt: 5 });
    expect(mockedUseQuery).toHaveBeenCalledWith(api.lists.queries.upNext, {
      refreshedAt: 5,
    });
  });
});
