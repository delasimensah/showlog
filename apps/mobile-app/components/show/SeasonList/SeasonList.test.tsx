import { fireEvent, render } from "@testing-library/react-native";

import SeasonList from "./SeasonList";

describe("SeasonList", () => {
  it("shows a year season and opens it", () => {
    const onOpenSeason = jest.fn();
    const { getByText, getByRole } = render(
      <SeasonList
        yearSeasons
        onOpenSeason={onOpenSeason}
        seasons={[{ number: 1999, episodeCount: 12, watchedCount: 0 }]}
      />
    );
    expect(getByText("1999")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
    fireEvent.press(getByRole("button", { name: "1999" }));
    expect(onOpenSeason).toHaveBeenCalledWith(1999);
  });
});
