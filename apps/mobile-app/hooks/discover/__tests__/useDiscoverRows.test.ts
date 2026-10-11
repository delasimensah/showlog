import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useDiscoverRows } from "../useDiscoverRows";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;
const taste = { listed: [1], genres: ["Drama"], watchesAnime: false };

describe("useDiscoverRows", () => {
  it("loads the suggestion rows for my list", () => {
    const rows = [{ title: "Top rated", shows: [] }];
    mockedUseQuery.mockReturnValueOnce(taste).mockReturnValueOnce(rows);

    const { result } = renderHook(() => useDiscoverRows());

    expect(mockedUseQuery).toHaveBeenCalledWith(api.discover.queries.taste, {});
    expect(mockedUseQuery).toHaveBeenCalledWith(
      api.discover.queries.rows,
      taste
    );
    expect(result.current).toBe(rows);
  });

  it("waits for my list and keeps the old rows while new ones load", () => {
    const rows = [{ title: "Top rated", shows: [] }];
    mockedUseQuery
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    const { result, rerender } = renderHook(() => useDiscoverRows());

    expect(mockedUseQuery).toHaveBeenCalledWith(
      api.discover.queries.rows,
      "skip"
    );
    expect(result.current).toBeUndefined();

    mockedUseQuery.mockReturnValueOnce(taste).mockReturnValueOnce(rows);
    rerender({});
    expect(result.current).toBe(rows);

    mockedUseQuery.mockReturnValue(undefined);
    rerender({});
    expect(result.current).toBe(rows);
  });
});
