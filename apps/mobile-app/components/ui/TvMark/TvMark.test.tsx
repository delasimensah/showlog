import { render } from "@testing-library/react-native";

import TvMark from "./TvMark";

describe("TvMark", () => {
  it("renders the tv icon", () => {
    const { getByText } = render(<TvMark />);
    expect(getByText("tv")).toBeTruthy();
  });
});
