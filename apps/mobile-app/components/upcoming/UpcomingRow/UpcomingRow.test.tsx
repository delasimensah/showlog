import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import UpcomingRow from "./UpcomingRow";

describe("UpcomingRow", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("shows the premiere and opens the show", () => {
    const { getByText, getByLabelText } = render(
      <UpcomingRow
        row={{
          tvmazeId: 42,
          showName: "The Rookie",
          headerUrl: null,
          posterUrl: null,
          imageUrl: null,
          label: "S5 | E1",
          premiere: true,
          episodeName: "Double Down",
          primary: "8:00 PM",
        }}
      />
    );

    expect(getByText("Premiere")).toBeTruthy();
    expect(getByText("8:00 PM")).toBeTruthy();
    expect(getByText("Double Down")).toBeTruthy();
    fireEvent.press(getByLabelText("The Rookie"));
    expect(push).toHaveBeenCalledWith("/show/42");
  });

  it("shows a show that has no air date", () => {
    const { getByText, queryByText } = render(
      <UpcomingRow
        row={{
          tvmazeId: 7,
          showName: "Untitled",
          headerUrl: null,
          posterUrl: null,
        }}
      />
    );

    expect(getByText("Waiting for an air date")).toBeTruthy();
    expect(queryByText("Premiere")).toBeNull();
  });
});
