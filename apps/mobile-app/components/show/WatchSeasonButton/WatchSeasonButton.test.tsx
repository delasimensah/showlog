import { fireEvent, render } from "@testing-library/react-native";

import WatchSeasonButton from "./WatchSeasonButton";

describe("WatchSeasonButton", () => {
  it("watches the season while episodes are left", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <WatchSeasonButton done={false} onPress={onPress} />
    );

    fireEvent.press(getByLabelText("Watch season"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("reads Season watched when nothing is left", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <WatchSeasonButton done onPress={onPress} />
    );

    fireEvent.press(getByLabelText("Season watched"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
