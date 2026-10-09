import { render } from "@testing-library/react-native";

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
  it("shows the progress and the seasons", () => {
    const { getByText } = render(<ShowOnList show={show} width={320} />);
    expect(getByText("0 of 20 watched")).toBeTruthy();
    expect(getByText("1999")).toBeTruthy();
  });
});
