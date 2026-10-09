import { render } from "@testing-library/react-native";

import Chip from "./Chip";

describe("Chip", () => {
  it("shows the label", () => {
    const { getByText } = render(<Chip label="Action" />);
    expect(getByText("Action")).toBeTruthy();
  });
});
