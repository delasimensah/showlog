import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useUpcoming } from "../useUpcoming";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useUpcoming", () => {
  it("loads episodes that have not aired", () => {
    const list = { episodes: [], noDate: [] };
    mockedUseQuery.mockReturnValue(list);
    const now = Date.UTC(2026, 9, 9, 12);

    const { result } = renderHook(() => useUpcoming(now));

    expect(mockedUseQuery).toHaveBeenCalledWith(api.lists.upcoming, { now });
    expect(result.current).toBe(list);
  });
});
