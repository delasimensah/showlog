import { fireEvent, render } from "@testing-library/react-native";

import EpisodeRow from "./EpisodeRow";

const base = {
  width: 320,
  yearSeasons: false,
  season: 1,
  number: 1,
  order: 1,
  name: "The beginning",
  imageUrl: null,
  fallbackUrl: null,
  now: new Date(2026, 0, 1).getTime(),
  onOpen: jest.fn(),
  onTick: jest.fn(),
  onWatchUpTo: jest.fn(),
};

describe("EpisodeRow", () => {
  it("shows a tick for an aired episode", () => {
    const onTick = jest.fn();
    const { getByLabelText, getByText } = render(
      <EpisodeRow
        {...base}
        aired
        watched={false}
        airsAt={new Date(2025, 11, 1).getTime()}
        onTick={onTick}
      />
    );

    expect(getByText("S1 | E1")).toBeTruthy();
    fireEvent.press(getByLabelText("Mark as watched"));
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("shows the countdown instead of a tick when the episode has not aired", () => {
    const { getByText, queryByLabelText } = render(
      <EpisodeRow
        {...base}
        aired={false}
        watched={false}
        airsAt={new Date(2026, 0, 6).getTime()}
      />
    );

    expect(getByText("in 5 days")).toBeTruthy();
    expect(queryByLabelText("Mark as watched")).toBeNull();
  });
});
