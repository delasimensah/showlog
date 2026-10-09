import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useAccount, useSession } from "@/hooks";

import ProfileScreen from "./ProfileScreen";

jest.mock("@/hooks", () => ({
  useAccount: jest.fn(),
  useSession: jest.fn(),
}));

const mockedAccount = useAccount as jest.Mock;
const mockedSession = useSession as jest.Mock;

describe("ProfileScreen", () => {
  const signOut = jest.fn();

  beforeEach(() => {
    signOut.mockReset();
    mockedAccount.mockReturnValue({
      name: "Ada",
      email: "me@example.com",
    });
    mockedSession.mockReturnValue({
      signOut,
      signIn: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("shows the account name and email", () => {
    const { getByText, queryByLabelText } = render(<ProfileScreen />);

    expect(queryByLabelText("Back")).toBeNull();
    expect(getByText("Ada")).toBeTruthy();
    expect(getByText("me@example.com")).toBeTruthy();
  });

  it("asks before signing out", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation();
    const { getByText } = render(<ProfileScreen />);

    fireEvent.press(getByText("Sign out"));

    expect(alertSpy).toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0]?.[2];
    const confirm = buttons?.find((button) => button.text === "Sign out");
    confirm?.onPress?.();
    expect(signOut).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});
