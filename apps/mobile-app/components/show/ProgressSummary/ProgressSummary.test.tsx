import { render } from "@testing-library/react-native";

import ProgressSummary from "./ProgressSummary";

describe("ProgressSummary", () => {
  it("shows how many episodes are watched", () => {
    const { getByText } = render(<ProgressSummary watched={0} aired={20} />);
    expect(getByText("0 of 20 watched")).toBeTruthy();
    expect(getByText("0%")).toBeTruthy();
  });
});
