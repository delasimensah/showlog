import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useAction } from "convex/react";

import { useAddShow } from "../useAddShow";

jest.mock("convex/react", () => ({
  useAction: jest.fn(),
}));

const mockedUseAction = useAction as jest.Mock;

describe("useAddShow", () => {
  it("returns the add action", () => {
    const add = jest.fn();
    mockedUseAction.mockReturnValue(add);

    const { result } = renderHook(() => useAddShow());

    expect(mockedUseAction).toHaveBeenCalledWith(api.shows.actions.add);
    expect(result.current).toBe(add);
  });
});
