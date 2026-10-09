import { render } from "@testing-library/react-native";

import { useSession } from "@/hooks";

import MainAppLayout from "./MainAppLayout";

jest.mock("@/hooks", () => ({
  useSession: jest.fn(),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

const mockedSession = useSession as jest.Mock;

describe("MainAppLayout", () => {
  it("sends a signed-out person back to sign in", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    const { getByText } = render(<MainAppLayout />);
    expect(getByText("redirect:/(auth)/sign-in")).toBeTruthy();
  });

  it("shows the tabs and profile once signed in", () => {
    mockedSession.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    const { getByText } = render(<MainAppLayout />);
    expect(getByText("(tabs)")).toBeTruthy();
    expect(getByText("profile")).toBeTruthy();
    expect(getByText("search")).toBeTruthy();
  });
});
