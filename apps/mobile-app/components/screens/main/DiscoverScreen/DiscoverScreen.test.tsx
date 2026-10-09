import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { useAddShow, useDiscoverRows } from "@/hooks";

import DiscoverScreen from "./DiscoverScreen";

jest.mock("@/hooks", () => ({
  useDiscoverRows: jest.fn(),
  useAddShow: jest.fn(),
}));

const mockedRows = useDiscoverRows as jest.Mock;
const mockedAdd = useAddShow as jest.Mock;

const row = {
  title: "Popular anime",
  shows: [
    {
      tvmazeId: 1,
      name: "The Bear",
      posterUrl: "https://img.example/bear.jpg",
      year: 2022,
    },
  ],
};

describe("DiscoverScreen", () => {
  const push = jest.fn();
  const addShow = jest.fn();

  beforeEach(() => {
    push.mockReset();
    addShow.mockReset();
    addShow.mockResolvedValue(null);
    (useRouter as jest.Mock).mockReturnValue({ push });
    mockedAdd.mockReturnValue(addShow);
    mockedRows.mockReturnValue([row]);
  });

  it("shows the empty list and opens Search", () => {
    mockedRows.mockReturnValue([]);
    const { getByText, getByLabelText } = render(<DiscoverScreen />);

    expect(getByText("Discover")).toBeTruthy();
    expect(getByText("No suggestions yet")).toBeTruthy();
    fireEvent.press(getByLabelText("Search"));
    expect(push).toHaveBeenCalledWith("/search");
  });

  it("keeps the title and search while suggestions load", () => {
    mockedRows.mockReturnValue(undefined);
    const { getByText, getByLabelText, getAllByTestId } = render(
      <DiscoverScreen />
    );

    expect(getByText("Discover")).toBeTruthy();
    expect(getByLabelText("Search")).toBeTruthy();
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("opens a show and adds it", async () => {
    const { getByText, getByLabelText, findByText } = render(
      <DiscoverScreen />
    );

    expect(getByText("Popular anime")).toBeTruthy();
    expect(getByText("2022")).toBeTruthy();
    fireEvent.press(getByLabelText("The Bear"));
    expect(push).toHaveBeenCalledWith("/show/1");

    fireEvent.press(getByLabelText("Add"));
    expect(addShow).toHaveBeenCalledWith({ tvmazeId: 1 });
    expect(await findByText("Added")).toBeTruthy();
  });
});
