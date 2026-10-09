import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { renderHook } from "@testing-library/react-native";

import { useSession } from "../useSession";

jest.mock("@convex-dev/auth/react", () => ({
  useConvexAuth: jest.fn(),
  useAuthActions: jest.fn(),
}));

const mockedAuth = useConvexAuth as jest.Mock;
const mockedActions = useAuthActions as jest.Mock;

describe("useSession", () => {
  it("returns the signed-in state and the auth actions", () => {
    const signIn = jest.fn();
    const signOut = jest.fn();
    mockedAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockedActions.mockReturnValue({ signIn, signOut });

    const { result } = renderHook(() => useSession());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.signIn).toBe(signIn);
    expect(result.current.signOut).toBe(signOut);
  });
});
