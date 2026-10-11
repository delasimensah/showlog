import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useMyShows } from "../useMyShows";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useMyShows", () => {
  it("loads the grid for the chosen sort", () => {
    const shows = [{ name: "The Bear" }];
    mockedUseQuery.mockReturnValue(shows);

    const { result } = renderHook(() => useMyShows("name"));

    expect(mockedUseQuery).toHaveBeenCalledWith(api.lists.queries.myShows, {
      sort: "name",
    });
    expect(result.current).toBe(shows);
  });
});
