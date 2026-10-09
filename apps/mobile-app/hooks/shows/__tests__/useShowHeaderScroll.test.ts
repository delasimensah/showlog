import { renderHook } from "@testing-library/react-native";

import { useShowHeaderScroll } from "../useShowHeaderScroll";

describe("useShowHeaderScroll", () => {
  it("returns a scroll position and a scroll handler", () => {
    const { result } = renderHook(() => useShowHeaderScroll(jest.fn()));

    expect(result.current.scrollY).toBeDefined();
    expect(typeof result.current.onScroll).toBe("function");
  });
});
