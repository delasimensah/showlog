import { render } from "@testing-library/react-native";

import { useSession } from "@/hooks";

import AuthLayout from "./AuthLayout";

jest.mock("@/hooks", () => ({
  useSession: jest.fn(),
}));

const mockedSession = useSession as jest.Mock;

describe("AuthLayout", () => {
  it("shows sign in while signed out", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    const { getByText } = render(<AuthLayout />);
    expect(getByText("sign-in")).toBeTruthy();
  });

  it("leaves sign in once a session exists", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    const { getByText } = render(<AuthLayout />);
    expect(getByText("redirect:/(main-app)/(tabs)")).toBeTruthy();
  });
});
