import { api } from "@convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useAction } from "convex/react";

import { usePreviewShow } from "../usePreviewShow";

jest.mock("convex/react", () => ({
  useAction: jest.fn(),
}));

const mockedUseAction = useAction as jest.Mock;

describe("usePreviewShow", () => {
  it("returns the preview action", () => {
    const preview = jest.fn();
    mockedUseAction.mockReturnValue(preview);

    const { result } = renderHook(() => usePreviewShow());

    expect(mockedUseAction).toHaveBeenCalledWith(api.shows.preview);
    expect(result.current).toBe(preview);
  });
});
