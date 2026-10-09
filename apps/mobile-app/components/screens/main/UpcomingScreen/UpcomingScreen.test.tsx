import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { hourStart, upcomingSections } from "shared";

import { useOpenedAt, useUpcoming } from "@/hooks";

import UpcomingScreen from "./UpcomingScreen";

jest.mock("@/hooks", () => ({
  useUpcoming: jest.fn(),
  useOpenedAt: jest.fn(),
}));

const mockedList = useUpcoming as jest.Mock;
const mockedNow = useOpenedAt as jest.Mock;

const empty = { episodes: [], noDate: [] };

describe("UpcomingScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push });
    mockedNow.mockReturnValue(Date.UTC(2026, 9, 9, 12));
    mockedList.mockReturnValue(empty);
  });

  it("shows the empty list", () => {
    const { getAllByText, getByText } = render(<UpcomingScreen />);

    expect(getAllByText("Upcoming").length).toBeGreaterThan(0);
    expect(getByText("Nothing scheduled yet")).toBeTruthy();
    expect(getByText("Nothing scheduled for your shows yet.")).toBeTruthy();
    fireEvent.press(getByText("Discover"));
    expect(push).toHaveBeenCalledWith("/discover");
  });

  it("keeps the title and shows skeletons while the list loads", () => {
    mockedList.mockReturnValue(undefined);
    const { getByText, getAllByTestId } = render(<UpcomingScreen />);

    expect(getByText("Upcoming")).toBeTruthy();
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("groups a later episode, a premiere, and a show with no date", () => {
    mockedList.mockReturnValue({
      episodes: [
        {
          showId: "shows-1",
          tvmazeId: 11,
          showName: "The Rookie",
          headerUrl: null,
          posterUrl: null,
          imageUrl: null,
          yearSeasons: false,
          network: "ABC",
          episodeId: "episodes-1",
          season: 5,
          number: 1,
          order: 1,
          name: "Double Down",
          airsAt: Date.UTC(2026, 9, 19, 20),
          airTimeKnown: true,
        },
      ],
      noDate: [
        {
          showId: "shows-2",
          tvmazeId: 22,
          showName: "Untitled",
          headerUrl: null,
          posterUrl: null,
        },
      ],
    });
    const { getByText, getByLabelText, queryByText } = render(
      <UpcomingScreen />
    );
    const openedAt = Date.UTC(2026, 9, 9, 12);
    const heading = upcomingSections(
      [{ airsAt: Date.UTC(2026, 9, 19, 20), airTimeKnown: true }],
      hourStart(openedAt),
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )[0]?.title;

    expect(getByText(heading ?? "")).toBeTruthy();
    expect(queryByText("Later")).toBeNull();
    expect(queryByText(/in \d+ days/)).toBeNull();
    expect(queryByText("ABC")).toBeNull();
    expect(getByText("Premiere")).toBeTruthy();
    expect(getByText("No date yet")).toBeTruthy();
    expect(getByText("Waiting for an air date")).toBeTruthy();
    fireEvent.press(getByLabelText("The Rookie"));
    expect(push).toHaveBeenCalledWith("/show/11");
  });
});
