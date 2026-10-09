import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useDiscoverRows } from "../useDiscoverRows";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useDiscoverRows", () => {
  it("loads the suggestion rows", () => {
    const rows = [{ title: "Top rated", shows: [] }];
    mockedUseQuery.mockReturnValue(rows);

    const { result } = renderHook(() => useDiscoverRows());

    expect(mockedUseQuery).toHaveBeenCalledWith(api.discover.rows, {});
    expect(result.current).toBe(rows);
  });
});
