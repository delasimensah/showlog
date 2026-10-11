import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useShow } from "../useShow";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useShow", () => {
  it("loads the show on my list", () => {
    const show = { name: "One Piece" };
    mockedUseQuery.mockReturnValue(show);

    const { result } = renderHook(() => useShow(1505));

    expect(mockedUseQuery).toHaveBeenCalledWith(api.shows.queries.get, {
      tvmazeId: 1505,
    });
    expect(result.current).toBe(show);
  });
});
