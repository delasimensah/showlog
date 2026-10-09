import { render } from "@testing-library/react-native";

import DiscoverScreen from "./DiscoverScreen";

describe("DiscoverScreen", () => {
  it("shows the empty list", () => {
    const { getAllByText, getByText } = render(<DiscoverScreen />);

    expect(getAllByText("Discover").length).toBeGreaterThan(0);
    expect(getByText("No suggestions yet")).toBeTruthy();
    expect(getByText("Shows you may like show up here.")).toBeTruthy();
  });
});
