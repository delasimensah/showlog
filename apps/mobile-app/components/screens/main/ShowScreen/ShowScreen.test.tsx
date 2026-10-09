import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";

import { useAddShow, usePreviewShow, useShow } from "@/hooks";

import ShowScreen from "./ShowScreen";

jest.mock("@/hooks", () => ({
  useShow: jest.fn(),
  usePreviewShow: jest.fn(),
  useAddShow: jest.fn(),
  useShowHeaderScroll: () => ({
    scrollY: { value: 0 },
    onScroll: jest.fn(),
  }),
  useTickEpisode: () => jest.fn(),
  useOpenedAt: () => Date.UTC(2026, 2, 12, 12),
  useBottomsheetStore: () => ({ openEpisodeSheet: jest.fn() }),
}));

jest.mock("@/utils", () => ({
  ...jest.requireActual("@/utils"),
  showErrorToast: jest.fn(),
}));

const mockedShow = useShow as jest.Mock;
const mockedPreview = usePreviewShow as jest.Mock;
const mockedAdd = useAddShow as jest.Mock;

const onList = {
  showId: "shows-1",
  tvmazeId: 1505,
  name: "One Piece",
  headerUrl: "https://img.example/header.jpg",
  posterUrl: "https://img.example/poster.jpg",
  network: "Fuji TV",
  summary: "Pirates.",
  genres: ["Action"],
  yearSeasons: true,
  seasons: [
    { number: 1999, episodeCount: 12, watchedCount: 0 },
    { number: 2026, episodeCount: 8, watchedCount: 0 },
  ],
  watchedCount: 0,
  airedCount: 20,
  waitingAfterNext: 0,
  leftOff: null,
  upNext: {
    episodeId: "episodes-1",
    season: 1999,
    number: 1,
    order: 1,
    name: "I'm Gonna Be King of the Pirates!",
    summary: null,
    runtime: 24,
    imageUrl: null,
    airsAt: null,
    airTimeKnown: false,
  },
};

const preview = {
  tvmazeId: 44702,
  name: "One Piece",
  genres: ["Action", "Adventure"],
  status: "Running",
  seasonCount: 2,
  summary: "Live action pirates.",
  headerUrl: null,
  posterUrl: null,
  network: "Netflix",
  rating: 8.7,
};

describe("ShowScreen", () => {
  const previewShow = jest.fn();
  const addShow = jest.fn();

  beforeEach(() => {
    previewShow.mockReset();
    addShow.mockReset();
    mockedPreview.mockReturnValue(previewShow);
    mockedAdd.mockReturnValue(addShow);
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  });

  it("shows skeletons while the show loads", () => {
    mockedShow.mockReturnValue(undefined);
    const { getAllByTestId, queryByLabelText } = render(
      <ShowScreen tvmazeId={1505} />
    );

    expect(queryByLabelText("Menu")).toBeNull();
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("shows year seasons and the TVmaze credit for a show on the list", () => {
    mockedShow.mockReturnValue(onList);
    const { getByText, getByRole, queryByText } = render(
      <ShowScreen tvmazeId={1505} />
    );

    expect(getByText("One Piece")).toBeTruthy();
    expect(getByText("2 seasons · Fuji TV")).toBeTruthy();
    expect(getByText("0 of 20 watched")).toBeTruthy();
    expect(getByText("1999")).toBeTruthy();
    expect(getByText("0/12")).toBeTruthy();
    expect(getByText("2026")).toBeTruthy();
    expect(getByText("0/8")).toBeTruthy();
    expect(getByText("Start with Episode 1")).toBeTruthy();
    expect(queryByText("Add to my list")).toBeNull();

    fireEvent.press(getByRole("link"));
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://www.tvmaze.com/shows/1505"
    );
  });

  it("shows Add for a show that is not on the list, then adds it", async () => {
    mockedShow.mockReturnValue(null);
    previewShow.mockResolvedValue(preview);
    addShow.mockResolvedValue({ myShowId: "my-shows-1" });
    const { getByText, queryByText, queryByLabelText } = render(
      <ShowScreen tvmazeId={44702} />
    );

    await waitFor(() => {
      expect(getByText("Add to my list")).toBeTruthy();
    });
    expect(getByText("2 seasons · Netflix · Running · Rated 8.7")).toBeTruthy();
    expect(getByText("Action")).toBeTruthy();
    expect(queryByText("More")).toBeNull();
    expect(queryByText("Seasons")).toBeNull();
    expect(queryByLabelText("Menu")).toBeNull();

    fireEvent.press(getByText("Add to my list"));
    await waitFor(() => {
      expect(addShow).toHaveBeenCalledWith({ tvmazeId: 44702 });
    });
  });

  it("keeps a long summary closed until More", async () => {
    mockedShow.mockReturnValue(null);
    previewShow.mockResolvedValue({
      ...preview,
      summary: "Pirates sail the Grand Line. ".repeat(20),
    });
    const { findByText, queryByText } = render(<ShowScreen tvmazeId={44702} />);

    fireEvent.press(await findByText("More"));
    expect(queryByText("Less")).toBeTruthy();
    expect(queryByText("More")).toBeNull();
  });
});
