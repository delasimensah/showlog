import { render } from "@testing-library/react-native";

import ProgressSummary from "./ProgressSummary";

describe("ProgressSummary", () => {
  it("shows how many episodes are watched", () => {
    const { getByText } = render(<ProgressSummary watched={0} aired={20} />);
    expect(getByText("0 of 20 watched")).toBeTruthy();
    expect(getByText("0%")).toBeTruthy();
  });

  it("reads Stopped in red when the show is stopped", () => {
    const { getByText, queryByText } = render(
      <ProgressSummary watched={4} aired={10} stopped />
    );
    expect(getByText("Stopped").props.className).toContain("text-danger");
    expect(queryByText("40%")).toBeNull();
  });

  it("shows the percentage in blue when the show is on Watch later", () => {
    const { getByText } = render(
      <ProgressSummary watched={4} aired={10} watchLater />
    );
    expect(getByText("40%").props.className).toContain("text-later");
  });
});
