import { fireEvent, render } from "@testing-library/react-native";

import TickButton from "./TickButton";

describe("TickButton", () => {
  it("ticks an episode that has not been watched", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <TickButton watched={false} onPress={onPress} />
    );

    fireEvent.press(getByLabelText("Mark as watched"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("reads Watched once the episode is ticked", () => {
    const { getByLabelText } = render(
      <TickButton watched onPress={jest.fn()} />
    );

    expect(getByLabelText("Watched")).toBeTruthy();
  });
});
