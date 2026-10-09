import { renderHook } from "@testing-library/react-native";

import { useOpenedAt } from "../useOpenedAt";

describe("useOpenedAt", () => {
  it("keeps the time from the first render", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const { result, rerender } = renderHook(() => useOpenedAt());
    jest.spyOn(Date, "now").mockReturnValue(1_800_000_000_000);
    rerender({});
    expect(result.current).toBe(1_700_000_000_000);
    jest.restoreAllMocks();
  });
});
