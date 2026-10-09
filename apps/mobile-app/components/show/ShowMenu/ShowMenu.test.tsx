import { fireEvent, render } from "@testing-library/react-native";

import ShowMenu from "./ShowMenu";

describe("ShowMenu", () => {
  it("offers Watch later, Stop watching, and Remove", () => {
    const onWatchLater = jest.fn();
    const onStop = jest.fn();
    const onRemove = jest.fn();
    const { getByLabelText } = render(
      <ShowMenu
        watchLater={false}
        stopped={false}
        onWatchLater={onWatchLater}
        onStop={onStop}
        onResume={jest.fn()}
        onRemove={onRemove}
      />
    );

    fireEvent.press(getByLabelText("Watch later"));
    fireEvent.press(getByLabelText("Stop watching"));
    fireEvent.press(getByLabelText("Remove from my list"));
    expect(onWatchLater).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("switches the labels when the show is saved for later or stopped", () => {
    const onResume = jest.fn();
    const { getByLabelText, queryByLabelText } = render(
      <ShowMenu
        watchLater
        stopped
        onWatchLater={jest.fn()}
        onStop={jest.fn()}
        onResume={onResume}
        onRemove={jest.fn()}
      />
    );

    fireEvent.press(getByLabelText("Remove from Watch later"));
    fireEvent.press(getByLabelText("Resume"));
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(queryByLabelText("Stop watching")).toBeNull();
    expect(queryByLabelText("Watch later")).toBeNull();
  });
});
