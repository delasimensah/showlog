import { render } from "@testing-library/react-native";

import SeasonList from "./SeasonList";

describe("SeasonList", () => {
  it("shows a year season and the season count", () => {
    const { getByText } = render(
      <SeasonList
        yearSeasons
        seasons={[{ number: 1999, episodeCount: 12, watchedCount: 0 }]}
      />
    );
    expect(getByText("1999")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
  });
});
