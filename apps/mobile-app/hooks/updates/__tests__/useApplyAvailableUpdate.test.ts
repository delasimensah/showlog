import { renderHook, waitFor } from "@testing-library/react-native";

import { useApplyAvailableUpdate } from "../useApplyAvailableUpdate";

describe("useApplyAvailableUpdate", () => {
  const dev = __DEV__;

  afterEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = dev;
  });

  it("does not block the development app", () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;

    const { result } = renderHook(() => useApplyAvailableUpdate());

    expect(result.current).toBe(false);
  });

  it("waits until the check finishes on a release build", async () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;

    const { result } = renderHook(() => useApplyAvailableUpdate());

    expect(result.current).toBe(true);
    await waitFor(() => expect(result.current).toBe(false));
  });
});
