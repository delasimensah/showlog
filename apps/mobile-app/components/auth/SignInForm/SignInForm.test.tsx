import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { useSession } from "@/hooks";

import SignInForm from "./SignInForm";

jest.mock("@/hooks", () => ({
  useSession: jest.fn(),
}));

const mockedSession = useSession as jest.Mock;

describe("SignInForm", () => {
  const signIn = jest.fn();

  beforeEach(() => {
    signIn.mockReset();
    mockedSession.mockReturnValue({
      signIn,
      signOut: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("does not submit an empty form", async () => {
    const { getByText } = render(<SignInForm />);

    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(getByText("Password is required")).toBeTruthy();
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("signs in with email and password", async () => {
    signIn.mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(<SignInForm />);

    fireEvent.changeText(getByLabelText("Email"), "me@example.com");
    fireEvent.changeText(getByLabelText("Password"), "secret-password");
    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("password", {
        email: "me@example.com",
        password: "secret-password",
        flow: "signIn",
      });
    });
  });

  it("creates an account when that mode is on", async () => {
    signIn.mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(<SignInForm />);

    fireEvent.press(getByText("Create account"));
    fireEvent.changeText(getByLabelText("Name"), "Ada");
    fireEvent.changeText(getByLabelText("Email"), "me@example.com");
    fireEvent.changeText(getByLabelText("Password"), "long-enough");
    fireEvent.press(getByText("Create account"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("password", {
        name: "Ada",
        email: "me@example.com",
        password: "long-enough",
        flow: "signUp",
      });
    });
  });

  it("shows a wrong password under the button", async () => {
    signIn.mockRejectedValue(new Error("Invalid credentials"));
    const { getByLabelText, getByText } = render(<SignInForm />);

    fireEvent.changeText(getByLabelText("Email"), "me@example.com");
    fireEvent.changeText(getByLabelText("Password"), "wrong-password");
    fireEvent.press(getByText("Sign in"));

    expect(
      await waitFor(() => getByText("Email or password is wrong."))
    ).toBeTruthy();
  });

  it("shows the one-account refusal", async () => {
    signIn.mockRejectedValue(
      new Error("Uncaught Error: This app already has an account.")
    );
    const { getByLabelText, getByText } = render(<SignInForm />);

    fireEvent.press(getByText("Create account"));
    fireEvent.changeText(getByLabelText("Name"), "Bea");
    fireEvent.changeText(getByLabelText("Email"), "other@example.com");
    fireEvent.changeText(getByLabelText("Password"), "long-enough");
    fireEvent.press(getByText("Create account"));

    expect(
      await waitFor(() => getByText("This app already has an account."))
    ).toBeTruthy();
  });
});
