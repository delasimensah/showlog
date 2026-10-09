import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { useOpenedAt, useTickUpNext, useUpNext } from "@/hooks";

import UpNextScreen from "./UpNextScreen";

jest.mock("@/hooks", () => ({
  useUpNext: jest.fn(),
  useTickUpNext: jest.fn(),
  useOpenedAt: jest.fn(),
}));

const mockedList = useUpNext as jest.Mock;
const mockedTick = useTickUpNext as jest.Mock;
const mockedNow = useOpenedAt as jest.Mock;

const empty = { upNext: [], paused: [], notStarted: [] };

describe("UpNextScreen", () => {
  const push = jest.fn();
  const tick = jest.fn();

  beforeEach(() => {
    push.mockReset();
    tick.mockReset();
    tick.mockResolvedValue(null);
    (useRouter as jest.Mock).mockReturnValue({ push });
    mockedTick.mockReturnValue(tick);
    mockedNow.mockReturnValue(Date.UTC(2026, 9, 9));
    mockedList.mockReturnValue(empty);
  });

  it("shows the empty list", () => {
    const { getAllByText, getByText, queryByLabelText } = render(
      <UpNextScreen />
    );

    expect(getAllByText("Up next").length).toBeGreaterThan(0);
    expect(getByText("Add the shows you watch")).toBeTruthy();
    expect(getByText("Find them in Discover.")).toBeTruthy();
    expect(queryByLabelText("Profile")).toBeNull();
  });

  it("opens Discover", () => {
    const { getByText } = render(<UpNextScreen />);

    fireEvent.press(getByText("Discover"));
    expect(push).toHaveBeenCalledWith("/discover");
  });

  it("keeps the title and shows skeletons while the list loads", () => {
    mockedList.mockReturnValue(undefined);
    const { getByText, getAllByTestId } = render(<UpNextScreen />);

    expect(getByText("Up next")).toBeTruthy();
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("ticks the episode on a row", () => {
    mockedList.mockReturnValue({
      ...empty,
      upNext: [
        {
          showId: "shows-1",
          tvmazeId: 1,
          showName: "The Bear",
          yearSeasons: false,
          headerUrl: null,
          posterUrl: null,
          episodeId: "episodes-1",
          season: 4,
          number: 11,
          order: 11,
          name: "Milim's Friend",
          imageUrl: null,
          waitingAfterNext: 0,
          lastWatchedAt: Date.UTC(2026, 9, 1),
        },
      ],
    });
    const { getByText, getByLabelText } = render(<UpNextScreen />);

    expect(getByText("S4 | E11")).toBeTruthy();
    fireEvent.press(getByLabelText("Mark as watched"));
    expect(tick).toHaveBeenCalledWith({ episodeId: "episodes-1" });
  });
});
