import { act, renderHook } from "@testing-library/react-native";

import { showErrorToast } from "@/utils";

import { usePullToRefresh } from "../usePullToRefresh";

jest.mock("@/utils", () => ({
  showErrorToast: jest.fn(),
}));

const mockedToast = showErrorToast as jest.Mock;

describe("usePullToRefresh", () => {
  beforeEach(() => {
    mockedToast.mockClear();
  });

  it("keeps the skeleton up until the list has been read again", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    const load = jest.fn(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const { result } = renderHook(() => usePullToRefresh(load));
    let pending: Promise<void> = Promise.resolve();

    act(() => {
      pending = result.current.onRefresh();
    });

    expect(result.current.refreshing).toBe(true);
    expect(load).toHaveBeenCalledWith(expect.any(Number));

    await act(async () => {
      resolve(null);
      await pending;
    });

    expect(result.current.refreshing).toBe(false);
    expect(mockedToast).not.toHaveBeenCalled();
  });

  it("says the refresh failed and shows the list again", async () => {
    const load = jest.fn(() => Promise.reject(new Error("offline")));
    const { result } = renderHook(() => usePullToRefresh(load));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(mockedToast).toHaveBeenCalledWith("Could not refresh.");
    expect(result.current.refreshing).toBe(false);
  });
});
