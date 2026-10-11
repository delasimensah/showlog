import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useUpNext } from "../useUpNext";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useUpNext", () => {
  it("loads the three sections", () => {
    const list = { upNext: [], paused: [], notStarted: [] };
    mockedUseQuery.mockReturnValue(list);

    const { result } = renderHook(() => useUpNext());

    expect(mockedUseQuery).toHaveBeenCalledWith(api.lists.queries.upNext, {});
    expect(result.current).toBe(list);
  });
});
