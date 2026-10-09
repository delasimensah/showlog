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
});
