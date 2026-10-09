import { render } from "@testing-library/react-native";

import { useSession } from "@/hooks";

import SignInScreen from "./SignInScreen";

jest.mock("@/hooks", () => ({
  useSession: jest.fn(),
}));

const mockedSession = useSession as jest.Mock;

describe("SignInScreen", () => {
  beforeEach(() => {
    mockedSession.mockReturnValue({
      signIn: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("shows the line and the sign-in fields", () => {
    const { getByText, getByLabelText, queryByText } = render(<SignInScreen />);

    expect(queryByText("Showlog")).toBeNull();
    expect(getByText("Track the shows you watch.")).toBeTruthy();
    expect(getByLabelText("Email")).toBeTruthy();
    expect(getByLabelText("Password")).toBeTruthy();
    expect(getByText("Sign in")).toBeTruthy();
    expect(getByText("Create account")).toBeTruthy();
  });
});
