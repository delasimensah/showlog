import { fireEvent, render } from "@testing-library/react-native";

import {
  useBottomsheetStore,
  useSeason,
  useShow,
  useTickEpisode,
  useUntickEpisode,
  useWatchSeason,
  useWatchUpTo,
} from "@/hooks";

import SeasonScreen from "./SeasonScreen";

jest.mock("@/hooks", () => ({
  useShow: jest.fn(),
  useSeason: jest.fn(),
  useTickEpisode: jest.fn(),
  useUntickEpisode: jest.fn(),
  useWatchSeason: jest.fn(),
  useWatchUpTo: jest.fn(),
  useBottomsheetStore: jest.fn(),
  useOpenedAt: () => new Date(1999, 9, 20).getTime(),
}));

const mockedShow = useShow as jest.Mock;
const mockedSeason = useSeason as jest.Mock;
const mockedTick = useTickEpisode as jest.Mock;
const mockedUntick = useUntickEpisode as jest.Mock;
const mockedWatchSeason = useWatchSeason as jest.Mock;
const mockedWatchUpTo = useWatchUpTo as jest.Mock;
const mockedSheets = useBottomsheetStore as unknown as jest.Mock;

const episode = {
  episodeId: "episodes-1",
  season: 1999,
  number: 1,
  order: 1,
  name: "Romance Dawn",
  summary: "A pirate sets out.",
  runtime: 24,
  imageUrl: null,
  airsAt: new Date(1999, 9, 20).getTime(),
  airTimeKnown: false,
  watched: false,
  aired: true,
};

describe("SeasonScreen", () => {
  const tick = jest.fn();
  const openEpisodeSheet = jest.fn();

  beforeEach(() => {
    tick.mockReset().mockResolvedValue(null);
    openEpisodeSheet.mockReset();
    mockedTick.mockReturnValue(tick);
    mockedUntick.mockReturnValue(jest.fn());
    mockedWatchSeason.mockReturnValue(jest.fn());
    mockedWatchUpTo.mockReturnValue(jest.fn());
    mockedSheets.mockReturnValue({ openEpisodeSheet });
    mockedShow.mockReturnValue({
      showId: "shows-1",
      name: "One Piece",
      yearSeasons: true,
      headerUrl: null,
      posterUrl: null,
    });
  });

  it("keeps the header and shows episode skeletons while the season loads", () => {
    mockedSeason.mockReturnValue(undefined);
    const { getAllByTestId } = render(
      <SeasonScreen tvmazeId={1505} seasonNumber={1999} />
    );
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("ticks an aired episode", () => {
    mockedSeason.mockReturnValue({
      showName: "One Piece",
      yearSeasons: true,
      headerUrl: null,
      posterUrl: null,
      episodes: [episode],
    });
    const { getByText, getByLabelText } = render(
      <SeasonScreen tvmazeId={1505} seasonNumber={1999} />
    );

    expect(getByText("Episode 1")).toBeTruthy();
    expect(getByText(/1999 · E1/)).toBeTruthy();
    fireEvent.press(getByLabelText("Mark as watched"));
    expect(tick).toHaveBeenCalledWith({ episodeId: "episodes-1" });
  });
});
