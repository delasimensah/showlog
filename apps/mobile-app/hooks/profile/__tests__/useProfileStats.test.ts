import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useProfileStats } from "../useProfileStats";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useProfileStats", () => {
  it("loads episodes watched and TV time", () => {
    const stats = { episodesWatched: 2, minutesWatched: 80 };
    mockedUseQuery.mockReturnValue(stats);

    const { result } = renderHook(() => useProfileStats());

    expect(mockedUseQuery).toHaveBeenCalledWith(api.profile.stats, {});
    expect(result.current).toBe(stats);
  });
});
