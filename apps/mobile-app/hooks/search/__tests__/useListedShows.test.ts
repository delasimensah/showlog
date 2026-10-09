import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useListedShows } from "../useListedShows";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useListedShows", () => {
  it("loads the ids on my list", () => {
    mockedUseQuery.mockReturnValue([7, 9]);

    const { result } = renderHook(() => useListedShows());

    expect(mockedUseQuery).toHaveBeenCalledWith(api.lists.myTvmazeIds, {});
    expect(result.current).toEqual([7, 9]);
  });
});
