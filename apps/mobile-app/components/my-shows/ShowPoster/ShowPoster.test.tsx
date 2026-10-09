import { fireEvent, render } from "@testing-library/react-native";

import ShowPoster from "./ShowPoster";

describe("ShowPoster", () => {
  it("shows the name and opens the show", () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <ShowPoster
        name="The Bear"
        posterUrl={null}
        watchedCount={4}
        airedCount={10}
        width={100}
        onPress={onPress}
      />
    );

    expect(getByText("The Bear")).toBeTruthy();
    fireEvent.press(getByLabelText("The Bear"));
    expect(onPress).toHaveBeenCalled();
  });

  it("names a Watch later show and a stopped show", () => {
    const { getByLabelText } = render(
      <>
        <ShowPoster
          name="Later"
          posterUrl={null}
          watchedCount={1}
          airedCount={4}
          watchLater
          width={100}
          onPress={jest.fn()}
        />
        <ShowPoster
          name="Done"
          posterUrl={null}
          watchedCount={1}
          airedCount={4}
          stopped
          width={100}
          onPress={jest.fn()}
        />
      </>
    );
    expect(getByLabelText("Later, Watch later")).toBeTruthy();
    expect(getByLabelText("Done, Stopped")).toBeTruthy();
  });
});
