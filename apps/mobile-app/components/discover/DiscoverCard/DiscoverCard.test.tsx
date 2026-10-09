import { fireEvent, render } from "@testing-library/react-native";

import DiscoverCard from "./DiscoverCard";

describe("DiscoverCard", () => {
  it("opens the show and adds it", () => {
    const onOpen = jest.fn();
    const onAdd = jest.fn();
    const { getByText, getByLabelText } = render(
      <DiscoverCard
        name="The Bear"
        posterUrl="https://img.example/bear.jpg"
        year={2022}
        added={false}
        adding={false}
        onOpen={onOpen}
        onAdd={onAdd}
      />
    );

    expect(getByText("2022")).toBeTruthy();
    fireEvent.press(getByLabelText("The Bear"));
    expect(onOpen).toHaveBeenCalled();
    fireEvent.press(getByLabelText("Add"));
    expect(onAdd).toHaveBeenCalled();
  });

  it("reads Added after the show is on my list", () => {
    const { getByText, queryByText } = render(
      <DiscoverCard
        name="The Bear"
        posterUrl="https://img.example/bear.jpg"
        year={2022}
        added
        adding={false}
        onOpen={jest.fn()}
        onAdd={jest.fn()}
      />
    );

    expect(getByText("Added")).toBeTruthy();
    expect(queryByText("2022")).toBeNull();
  });
});
