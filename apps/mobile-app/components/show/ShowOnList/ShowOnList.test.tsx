import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import ShowOnList from "./ShowOnList";

const show = {
  tvmazeId: 1505,
  name: "One Piece",
  network: "Fuji TV",
  summary: "Pirates.",
  genres: ["Action"],
  yearSeasons: true,
  seasons: [{ number: 1999, episodeCount: 12, watchedCount: 0 }],
  watchedCount: 0,
  airedCount: 20,
};

describe("ShowOnList", () => {
  it("shows the progress and opens a season", () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    const { getByText, getByRole } = render(
      <ShowOnList show={show} width={320} />
    );
    expect(getByText("0 of 20 watched")).toBeTruthy();
    expect(getByText("1999")).toBeTruthy();
    fireEvent.press(getByRole("button", { name: "1999" }));
    expect(push).toHaveBeenCalledWith("/show/1505/season/1999");
  });
});
