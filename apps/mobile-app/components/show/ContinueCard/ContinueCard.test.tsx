import { fireEvent, render } from "@testing-library/react-native";

import ContinueCard from "./ContinueCard";

const now = Date.UTC(2026, 2, 12, 12);
const start = {
  episodeId: "episodes-1",
  season: 1,
  number: 1,
  order: 1,
  name: "Romance Dawn",
  summary: null,
};

describe("ContinueCard", () => {
  it("shows where to start when nothing is watched", () => {
    const onTick = jest.fn();
    const onOpenNext = jest.fn();
    const { getByText, getByLabelText } = render(
      <ContinueCard
        yearSeasons={false}
        now={now}
        leftOff={null}
        upNext={start}
        onTick={onTick}
        onOpenLeft={jest.fn()}
        onOpenNext={onOpenNext}
      />
    );

    expect(getByText("Start with S1 | E1")).toBeTruthy();
    expect(getByText("Nothing watched yet")).toBeTruthy();
    fireEvent.press(getByLabelText("Romance Dawn"));
    expect(onOpenNext).toHaveBeenCalled();
    fireEvent.press(getByLabelText("Mark as watched"));
    expect(onTick).toHaveBeenCalled();
  });

  it("shows the last episode and the next one", () => {
    const { getByText } = render(
      <ContinueCard
        yearSeasons
        now={now}
        leftOff={{
          ...start,
          name: "I'm Gonna Be King of the Pirates!",
          summary: "Luffy sets sail.",
          watchedAt: now,
        }}
        upNext={{
          episodeId: "episodes-2",
          season: 1999,
          number: 2,
          order: 2,
          name: "The Great Swordsman Appears",
          summary: null,
        }}
        onTick={jest.fn()}
        onOpenLeft={jest.fn()}
        onOpenNext={jest.fn()}
      />
    );

    expect(getByText("Last watched · 12 Mar")).toBeTruthy();
    expect(getByText("Episode 1")).toBeTruthy();
    expect(getByText("Luffy sets sail.")).toBeTruthy();
    expect(getByText("Episode 2")).toBeTruthy();
    expect(getByText("The Great Swordsman Appears")).toBeTruthy();
  });
});
