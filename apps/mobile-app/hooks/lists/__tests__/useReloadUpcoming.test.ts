import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useConvex } from "convex/react";

import { useReloadUpcoming } from "../useReloadUpcoming";

jest.mock("convex/react", () => ({
  useConvex: jest.fn(),
}));

const mockedUseConvex = useConvex as jest.Mock;

describe("useReloadUpcoming", () => {
  it("reads the list again at the pull time", () => {
    const query = jest.fn(() => Promise.resolve(null));
    mockedUseConvex.mockReturnValue({ query });

    const { result } = renderHook(() => useReloadUpcoming());
    void result.current(5);

    expect(query).toHaveBeenCalledWith(api.lists.queries.upcoming, {
      now: 5,
    });
  });
});
