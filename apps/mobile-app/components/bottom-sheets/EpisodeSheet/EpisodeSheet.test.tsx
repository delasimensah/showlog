import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fireEvent, render } from "@testing-library/react-native";

import { useBottomsheetStore } from "@/hooks";

import EpisodeSheet from "./EpisodeSheet";

const mockTick = jest.fn();
const mockUntick = jest.fn();
const mockWatchUpTo = jest.fn();

jest.mock("@/hooks", () => ({
  useBottomsheetStore: jest.fn(),
  useTickEpisode: () => mockTick,
  useUntickEpisode: () => mockUntick,
  useWatchUpTo: () => mockWatchUpTo,
  useOpenedAt: () => new Date(2026, 0, 14).getTime(),
}));

const mockedStore = useBottomsheetStore as unknown as jest.Mock;

describe("EpisodeSheet", () => {
  it("marks an aired episode as watched", () => {
    mockTick.mockResolvedValue(null);
    mockedStore.mockImplementation((selector?: (state: object) => unknown) => {
      const state = {
        episode: {
          episodeId: "episodes-1",
          showId: "shows-1",
          tvmazeId: 1,
          season: 4,
          number: 11,
          order: 40,
          name: "Milim's Friend",
          summary: "A visit.",
          airsAt: new Date(2026, 0, 14).getTime(),
          airTimeKnown: true,
          runtime: 52,
          imageUrl: null,
          headerUrl: null,
          posterUrl: null,
          watched: false,
          aired: true,
          yearSeasons: false,
        },
        setEpisodeSheetRef: jest.fn(),
      };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(
      <BottomSheetModalProvider>
        <EpisodeSheet />
      </BottomSheetModalProvider>
    );

    expect(getByText("S4 | E11")).toBeTruthy();
    fireEvent.press(getByText("Mark as watched"));
    expect(mockTick).toHaveBeenCalledWith({ episodeId: "episodes-1" });
  });
});
