import { render } from "@testing-library/react-native";

import { useSession } from "@/hooks";

import AuthGate from "./AuthGate";

jest.mock("@/hooks", () => ({
  useSession: jest.fn(),
}));

const mockedSession = useSession as jest.Mock;

describe("AuthGate", () => {
  it("sends a signed-out person to sign in", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    const { getByText } = render(<AuthGate />);
    expect(getByText("redirect:/(auth)/sign-in")).toBeTruthy();
  });

  it("sends a signed-in person to the tabs", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    const { getByText } = render(<AuthGate />);
    expect(getByText("redirect:/(main-app)/(tabs)/up-next")).toBeTruthy();
  });

  it("waits while the session is loading", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
    const { getAllByTestId, queryByText } = render(<AuthGate />);
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
    expect(queryByText(/redirect:/)).toBeNull();
  });
});
