import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import UpNextScreen from "./UpNextScreen";

describe("UpNextScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("shows the empty list", () => {
    const { getAllByText, getByText, queryByLabelText } = render(
      <UpNextScreen />
    );

    expect(getAllByText("Up next").length).toBeGreaterThan(0);
    expect(getByText("Add the shows you watch")).toBeTruthy();
    expect(getByText("Find them in Discover.")).toBeTruthy();
    expect(queryByLabelText("Profile")).toBeNull();
  });

  it("opens Discover", () => {
    const { getByText } = render(<UpNextScreen />);

    fireEvent.press(getByText("Discover"));
    expect(push).toHaveBeenCalledWith("/discover");
  });
});
