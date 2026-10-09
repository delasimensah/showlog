import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import { useAccount } from "../useAccount";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("useAccount", () => {
  it("returns the signed-in account", () => {
    mockedUseQuery.mockReturnValue({
      name: "Ada",
      email: "me@example.com",
    });

    const { result } = renderHook(() => useAccount());

    expect(result.current).toEqual({
      name: "Ada",
      email: "me@example.com",
    });
  });
});
