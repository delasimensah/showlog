import { fireEvent, render } from "@testing-library/react-native";

import ShowSeasonRow from "./ShowSeasonRow";

describe("ShowSeasonRow", () => {
  it("shows the season count and opens when pressed", () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = render(
      <ShowSeasonRow
        label="Season 1"
        watchedCount={0}
        episodeCount={12}
        first
        onPress={onPress}
      />
    );
    expect(getByText("Season 1")).toBeTruthy();
    expect(getByText("0/12")).toBeTruthy();
    fireEvent.press(getByRole("button", { name: "Season 1" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
