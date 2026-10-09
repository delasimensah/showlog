import { render } from "@testing-library/react-native";

import ShowMenuButton from "./ShowMenuButton";

describe("ShowMenuButton", () => {
  it("shows the menu button", () => {
    const { getByLabelText } = render(<ShowMenuButton />);
    expect(getByLabelText("Menu")).toBeTruthy();
  });
});
