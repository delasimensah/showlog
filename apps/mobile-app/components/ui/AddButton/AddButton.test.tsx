import { fireEvent, render } from "@testing-library/react-native";

import AddButton from "./AddButton";

describe("AddButton", () => {
  it("adds when the show is not on the list", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <AddButton added={false} onPress={onPress} />
    );

    fireEvent.press(getByLabelText("Add"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not add again once the show is on the list", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<AddButton added onPress={onPress} />);

    fireEvent.press(getByLabelText("On your list"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
