import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { useAddShow, useSearchShows } from "@/hooks";

import SearchScreen from "./SearchScreen";

jest.mock("@/hooks", () => ({
  useSearchShows: jest.fn(),
  useAddShow: jest.fn(),
}));

jest.mock("@/utils", () => ({
  showErrorToast: jest.fn(),
}));

const mockedSearch = useSearchShows as jest.Mock;
const mockedAdd = useAddShow as jest.Mock;

const onePiece = {
  tvmazeId: 1505,
  name: "One Piece",
  posterUrl: "https://img.example/one-piece.jpg",
  type: "Animation",
  language: "Japanese",
  year: 1999,
  network: "Fuji TV",
  onList: false,
};

const liveAction = {
  tvmazeId: 44702,
  name: "One Piece",
  posterUrl: null,
  type: "Scripted",
  language: "English",
  year: 2023,
  network: "Netflix",
  onList: false,
};

describe("SearchScreen", () => {
  const searchShows = jest.fn();
  const addShow = jest.fn();
  const back = jest.fn();

  beforeEach(() => {
    searchShows.mockReset();
    addShow.mockReset();
    back.mockReset();
    mockedSearch.mockReturnValue(searchShows);
    mockedAdd.mockReturnValue(addShow);
    (useRouter as jest.Mock).mockReturnValue({ back, push: jest.fn() });
  });

  it("asks for a name before searching", () => {
    const { getByText, getByLabelText } = render(<SearchScreen />);

    expect(getByLabelText("Search")).toBeTruthy();
    expect(getByText("Search for a show")).toBeTruthy();
    expect(getByText("Type a name. Show data comes from TVmaze.")).toBeTruthy();
    expect(searchShows).not.toHaveBeenCalled();
  });

  it("shows matching shows and marks one as on the list after adding", async () => {
    searchShows.mockResolvedValue([onePiece, liveAction]);
    addShow.mockResolvedValue({ myShowId: "my-shows-1" });
    const { getByLabelText, getByText, getAllByLabelText } = render(
      <SearchScreen />
    );

    fireEvent.changeText(getByLabelText("Search"), "one piece");

    await waitFor(() => {
      expect(searchShows).toHaveBeenCalledWith({ query: "one piece" });
    });
    expect(getByText("Animation · Japanese · 1999 · Fuji TV")).toBeTruthy();
    expect(getByText("Scripted · English · 2023 · Netflix")).toBeTruthy();

    fireEvent.press(getAllByLabelText("Add")[0]);

    await waitFor(() => {
      expect(getByText("On your list")).toBeTruthy();
    });
    expect(addShow).toHaveBeenCalledWith({ tvmazeId: 1505 });
  });

  it("says when nothing matches", async () => {
    searchShows.mockResolvedValue([]);
    const { getByLabelText, getByText } = render(<SearchScreen />);

    fireEvent.changeText(getByLabelText("Search"), "zzzz");

    await waitFor(() => {
      expect(getByText('No shows match "zzzz".')).toBeTruthy();
    });
  });

  it("goes back when Cancel is pressed", () => {
    const { getByLabelText } = render(<SearchScreen />);
    fireEvent.press(getByLabelText("Cancel"));
    expect(back).toHaveBeenCalledTimes(1);
  });
});
