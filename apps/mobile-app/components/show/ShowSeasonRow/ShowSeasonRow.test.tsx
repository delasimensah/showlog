import { render } from "@testing-library/react-native";

import ShowSeasonRow from "./ShowSeasonRow";

describe("ShowSeasonRow", () => {
  it("shows the season count", () => {
    const { getByText } = render(
      <ShowSeasonRow
        label="Season 1"
        watchedCount={0}
        episodeCount={12}
        first
      />
    );
    expect(getByText("Season 1")).toBeTruthy();
    expect(getByText("0/12")).toBeTruthy();
  });
});
