import { render } from "@testing-library/react-native";

import ContinueCard from "./ContinueCard";

describe("ContinueCard", () => {
  it("shows where to start", () => {
    const { getByText } = render(<ContinueCard />);
    expect(getByText("Start with S1 | E1")).toBeTruthy();
  });
});
