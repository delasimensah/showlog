import { render } from "@testing-library/react-native";

import AppTabs from "./AppTabs";

describe("AppTabs", () => {
  it("lists the four tabs in order", () => {
    const { getByText } = render(<AppTabs />);

    expect(getByText("Watching")).toBeTruthy();
    expect(getByText("Upcoming")).toBeTruthy();
    expect(getByText("Discover")).toBeTruthy();
    expect(getByText("My shows")).toBeTruthy();
  });
});
