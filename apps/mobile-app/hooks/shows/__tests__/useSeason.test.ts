import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useSeason } from "../useSeason";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useSeason", () => {
  it("loads the season once the show id is known", () => {
    const season = { showName: "Example", episodes: [] };
    mockedUseQuery.mockReturnValue(season);

    const { result } = renderHook(() => useSeason("shows-1" as never, 1));

    expect(mockedUseQuery).toHaveBeenCalledWith(api.shows.queries.season, {
      showId: "shows-1",
      season: 1,
    });
    expect(result.current).toBe(season);
  });
});
