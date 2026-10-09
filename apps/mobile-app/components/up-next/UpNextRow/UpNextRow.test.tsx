import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import UpNextRow, { type UpNextRowData } from "./UpNextRow";

const now = Date.UTC(2026, 9, 9, 12);
const row: UpNextRowData = {
  showId: "shows-1",
  tvmazeId: 1505,
  showName: "One Piece",
  yearSeasons: true,
  headerUrl: null,
  posterUrl: null,
  episodeId: "episodes-1",
  season: 2026,
  number: 25,
  order: 1180,
  name: "Milim's Friend",
  imageUrl: null,
  waitingAfterNext: 3,
  lastWatchedAt: now - 7 * 30 * 24 * 60 * 60 * 1000,
};

describe("UpNextRow", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the next episode and ticks it", () => {
    jest.useFakeTimers();
    const push = jest.fn();
    const onTick = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    const { getByText, getByLabelText, queryByText } = render(
      <UpNextRow row={row} onTick={onTick} />
    );

    expect(getByText("Episode 1180")).toBeTruthy();
    expect(getByText("2026 · E25")).toBeTruthy();
    expect(getByText("+3")).toBeTruthy();
    expect(getByText("Milim's Friend")).toBeTruthy();
    expect(queryByText(/ago/)).toBeNull();
    fireEvent.press(getByLabelText("One Piece"));
    expect(push).toHaveBeenCalledWith("/show/1505");
    fireEvent.press(getByLabelText("Mark as watched"));
    expect(getByLabelText("Watched")).toBeTruthy();
    expect(onTick).not.toHaveBeenCalled();
    jest.advanceTimersByTime(320);
    expect(onTick).toHaveBeenCalled();
  });
});
