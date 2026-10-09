import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import DiscoverScreen from "./DiscoverScreen";

describe("DiscoverScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("shows the empty list and opens Search", () => {
    const { getAllByText, getByText, getByLabelText } = render(
      <DiscoverScreen />
    );

    expect(getAllByText("Discover").length).toBeGreaterThan(0);
    expect(getByText("No suggestions yet")).toBeTruthy();
    expect(getByText("Shows you may like show up here.")).toBeTruthy();

    fireEvent.press(getByLabelText("Search"));
    expect(push).toHaveBeenCalledWith("/search");
  });
});
