import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useConvex } from "convex/react";

import { useReloadUpNext } from "../useReloadUpNext";

jest.mock("convex/react", () => ({
  useConvex: jest.fn(),
}));

const mockedUseConvex = useConvex as jest.Mock;

describe("useReloadUpNext", () => {
  it("reads the list again at the pull time", () => {
    const query = jest.fn(() => Promise.resolve(null));
    mockedUseConvex.mockReturnValue({ query });

    const { result } = renderHook(() => useReloadUpNext());
    void result.current(5);

    expect(query).toHaveBeenCalledWith(api.lists.queries.upNext, {
      refreshedAt: 5,
    });
  });
});
