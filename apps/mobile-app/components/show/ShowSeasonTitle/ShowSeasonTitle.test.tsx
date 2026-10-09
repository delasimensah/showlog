import { render } from "@testing-library/react-native";

import ShowSeasonTitle from "./ShowSeasonTitle";

describe("ShowSeasonTitle", () => {
  it("shows the season and the show name", () => {
    const { getByText } = render(
      <ShowSeasonTitle title="Season 4" showName="The Bear" />
    );
    expect(getByText("Season 4")).toBeTruthy();
    expect(getByText("The Bear").props.numberOfLines).toBe(1);
  });

  it("keeps a long show name on one line", () => {
    const { getByText } = render(
      <ShowSeasonTitle
        title="Season 1"
        showName="That Time I Got Reincarnated as a Slime"
      />
    );
    expect(
      getByText("That Time I Got Reincarnated as a Slime").props.numberOfLines
    ).toBe(1);
  });
});
