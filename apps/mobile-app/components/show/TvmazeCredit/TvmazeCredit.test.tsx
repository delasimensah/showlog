import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";

import TvmazeCredit from "./TvmazeCredit";

describe("TvmazeCredit", () => {
  it("opens the show on TVmaze", () => {
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const { getByRole } = render(<TvmazeCredit tvmazeId={1505} />);

    fireEvent.press(getByRole("link"));
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://www.tvmaze.com/shows/1505"
    );
  });
});
