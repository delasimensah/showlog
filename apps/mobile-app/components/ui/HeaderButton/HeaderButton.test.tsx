import { fireEvent, render } from "@testing-library/react-native";

import HeaderButton from "./HeaderButton";

describe("HeaderButton", () => {
  it("calls onPress", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <HeaderButton
        icon="person"
        accessibilityLabel="Profile"
        onPress={onPress}
      />
    );

    fireEvent.press(getByLabelText("Profile"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
