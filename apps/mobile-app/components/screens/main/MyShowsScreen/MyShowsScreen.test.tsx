import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import {
  type MyShowsFilter,
  type MyShowsSort,
  useMyShows,
  useMyShowsChoice,
} from "@/hooks";

import MyShowsScreen from "./MyShowsScreen";

jest.mock("@/hooks", () => {
  const actual = jest.requireActual("@/hooks/my-shows/useMyShowsChoice");
  return {
    useMyShows: jest.fn(),
    useMyShowsChoice: jest.fn(),
    MY_SHOWS_SORTS: actual.MY_SHOWS_SORTS,
    MY_SHOWS_FILTERS: actual.MY_SHOWS_FILTERS,
  };
});

const mockedShows = useMyShows as jest.Mock;
const mockedChoice = useMyShowsChoice as unknown as jest.Mock;

const choice: {
  sort: MyShowsSort;
  filter: MyShowsFilter;
  setSort: jest.Mock;
  setFilter: jest.Mock;
} = {
  sort: "lastWatched",
  filter: "All",
  setSort: jest.fn(),
  setFilter: jest.fn(),
};

const bear = {
  showId: "shows-1",
  tvmazeId: 1,
  name: "The Bear",
  posterUrl: null,
  watchedCount: 4,
  airedCount: 10,
  status: "Watching" as const,
};

describe("MyShowsScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push });
    mockedChoice.mockImplementation(
      (select: (state: typeof choice) => unknown) => select(choice)
    );
    mockedShows.mockReturnValue([]);
  });

  it("shows the empty list and opens Discover", () => {
    const { getAllByText, getByText, queryByLabelText } = render(
      <MyShowsScreen />
    );

    expect(getAllByText("My shows").length).toBeGreaterThan(0);
    expect(getByText("Your list is empty")).toBeTruthy();
    expect(queryByLabelText("Sort and filter")).toBeNull();

    fireEvent.press(getByText("Discover"));
    expect(push).toHaveBeenCalledWith("/discover");
  });

  it("opens Profile", () => {
    const { getByLabelText } = render(<MyShowsScreen />);

    fireEvent.press(getByLabelText("Profile"));
    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("keeps the title and the sort button while the grid loads", () => {
    mockedShows.mockReturnValue(undefined);
    const { getByText, getByLabelText, getAllByTestId } = render(
      <MyShowsScreen />
    );

    expect(getByText("My shows")).toBeTruthy();
    expect(getByLabelText("Sort and filter")).toBeTruthy();
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("filters to one status and opens that show", () => {
    mockedChoice.mockImplementation(
      (select: (state: typeof choice) => unknown) =>
        select({ ...choice, filter: "Watching" })
    );
    mockedShows.mockReturnValue([
      bear,
      {
        ...bear,
        showId: "shows-2",
        tvmazeId: 2,
        name: "Severance",
        status: "Finished",
      },
    ]);
    const { getByText, queryByText, getByLabelText } = render(
      <MyShowsScreen />
    );

    expect(getByText("Watching · 1")).toBeTruthy();
    expect(getByText("The Bear")).toBeTruthy();
    expect(queryByText("Severance")).toBeNull();
    fireEvent.press(getByLabelText("The Bear"));
    expect(push).toHaveBeenCalledWith("/show/1");
  });

  it("opens Discover when a filter matches nothing", () => {
    mockedChoice.mockImplementation(
      (select: (state: typeof choice) => unknown) =>
        select({ ...choice, filter: "Finished" })
    );
    mockedShows.mockReturnValue([bear]);
    const { getByText } = render(<MyShowsScreen />);

    expect(getByText("No Finished shows")).toBeTruthy();
    expect(getByText("Shows you finish show up here.")).toBeTruthy();
    fireEvent.press(getByText("Discover"));
    expect(push).toHaveBeenCalledWith("/discover");
  });
});
