import { render } from "@testing-library/react-native";

import UpNextSection from "./UpNextSection";

describe("UpNextSection", () => {
  it("shows the heading and the show", () => {
    const { getByText } = render(
      <UpNextSection
        title="Paused for a while"
        onTick={jest.fn()}
        rows={[
          {
            showId: "shows-1",
            tvmazeId: 1,
            showName: "The Bear",
            yearSeasons: false,
            headerUrl: null,
            posterUrl: null,
            episodeId: "episodes-1",
            season: 1,
            number: 1,
            order: 1,
            name: "System",
            imageUrl: null,
            waitingAfterNext: 0,
            lastWatchedAt: null,
          },
        ]}
      />
    );

    expect(getByText("Paused for a while")).toBeTruthy();
    expect(getByText("The Bear")).toBeTruthy();
  });
});
