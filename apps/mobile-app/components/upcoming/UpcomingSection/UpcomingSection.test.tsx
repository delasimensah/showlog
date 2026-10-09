import { render } from "@testing-library/react-native";

import UpcomingSection from "./UpcomingSection";

describe("UpcomingSection", () => {
  it("shows the day and the episode", () => {
    const { getByText } = render(
      <UpcomingSection
        title="Friday"
        date="9 Oct"
        rows={[
          {
            tvmazeId: 1,
            showName: "The Rookie",
            headerUrl: null,
            posterUrl: null,
            imageUrl: null,
            label: "S5 | E2",
            premiere: false,
            episodeName: "The List",
            primary: "8:00 PM",
          },
        ]}
      />
    );

    expect(getByText("Friday")).toBeTruthy();
    expect(getByText("9 Oct")).toBeTruthy();
    expect(getByText("8:00 PM")).toBeTruthy();
  });
});
