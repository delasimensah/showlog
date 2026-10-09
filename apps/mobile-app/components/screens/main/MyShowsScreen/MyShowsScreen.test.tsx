import { render } from "@testing-library/react-native";

import MyShowsScreen from "./MyShowsScreen";

describe("MyShowsScreen", () => {
  it("shows the empty list", () => {
    const { getAllByText, getByText } = render(<MyShowsScreen />);

    expect(getAllByText("My shows").length).toBeGreaterThan(0);
    expect(getByText("Your list is empty")).toBeTruthy();
    expect(getByText("Search for a show to add it.")).toBeTruthy();
  });
});
