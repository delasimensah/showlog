import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useAction } from "convex/react";

import { useSearchShows } from "../useSearchShows";

jest.mock("convex/react", () => ({
  useAction: jest.fn(),
}));

const mockedUseAction = useAction as jest.Mock;

describe("useSearchShows", () => {
  it("returns the search action", () => {
    const search = jest.fn();
    mockedUseAction.mockReturnValue(search);

    const { result } = renderHook(() => useSearchShows());

    expect(mockedUseAction).toHaveBeenCalledWith(
      api.search.actions.searchShows
    );
    expect(result.current).toBe(search);
  });
});
