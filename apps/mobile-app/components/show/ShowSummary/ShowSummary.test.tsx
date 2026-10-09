import { fireEvent, render } from "@testing-library/react-native";

import ShowSummary from "./ShowSummary";

describe("ShowSummary", () => {
  it("keeps a long summary closed until More", () => {
    const { getByText, queryByText } = render(
      <ShowSummary text={"Pirates sail the Grand Line. ".repeat(20)} />
    );

    fireEvent.press(getByText("More"));
    expect(queryByText("Less")).toBeTruthy();
    expect(queryByText("More")).toBeNull();
  });
});
