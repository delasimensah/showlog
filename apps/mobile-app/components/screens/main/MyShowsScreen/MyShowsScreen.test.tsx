import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import MyShowsScreen from "./MyShowsScreen";

describe("MyShowsScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("shows the empty list and opens Discover", () => {
    const { getAllByText, getByText } = render(<MyShowsScreen />);

    expect(getAllByText("My shows").length).toBeGreaterThan(0);
    expect(getByText("Your list is empty")).toBeTruthy();
    expect(getByText("Find a show in Discover.")).toBeTruthy();

    fireEvent.press(getByText("Discover"));
    expect(push).toHaveBeenCalledWith("/discover");
  });

  it("opens Profile", () => {
    const { getByLabelText } = render(<MyShowsScreen />);

    fireEvent.press(getByLabelText("Profile"));
    expect(push).toHaveBeenCalledWith("/profile");
  });
});
