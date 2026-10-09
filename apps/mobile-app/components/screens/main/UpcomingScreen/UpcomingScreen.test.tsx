import { render } from "@testing-library/react-native";

import UpcomingScreen from "./UpcomingScreen";

describe("UpcomingScreen", () => {
  it("shows the empty list", () => {
    const { getAllByText, getByText } = render(<UpcomingScreen />);

    expect(getAllByText("Upcoming").length).toBeGreaterThan(0);
    expect(getByText("Nothing scheduled yet")).toBeTruthy();
    expect(getByText("Nothing scheduled for your shows yet.")).toBeTruthy();
  });
});
