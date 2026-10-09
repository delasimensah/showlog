import { fireEvent, render } from "@testing-library/react-native";

import TextField from "./TextField";

describe("TextField", () => {
  it("shows the label and reports typed text", () => {
    const onChangeText = jest.fn();
    const { getByLabelText, getByText } = render(
      <TextField label="Email" value="" onChangeText={onChangeText} />
    );

    expect(getByText("Email")).toBeTruthy();
    fireEvent.changeText(getByLabelText("Email"), "me@example.com");
    expect(onChangeText).toHaveBeenCalledWith("me@example.com");
  });

  it("shows the password when asked", () => {
    const { getByLabelText } = render(
      <TextField
        label="Password"
        value="secret-password"
        onChangeText={jest.fn()}
        secureTextEntry
      />
    );

    const input = getByLabelText("Password");
    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(getByLabelText("Show password"));
    expect(input.props.secureTextEntry).toBe(false);

    fireEvent.press(getByLabelText("Hide password"));
    expect(input.props.secureTextEntry).toBe(true);
  });

  it("shows a field error", () => {
    const { getByText } = render(
      <TextField
        label="Password"
        value=""
        onChangeText={jest.fn()}
        error="Password is required"
      />
    );

    expect(getByText("Password is required")).toBeTruthy();
  });
});
