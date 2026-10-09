import { render } from "@testing-library/react-native";

import SortFilterSheet from "./SortFilterSheet";

describe("SortFilterSheet", () => {
  it("shows the sort and filter choices when open", () => {
    const { getByText } = render(
      <SortFilterSheet
        isPresented
        onIsPresentedChange={jest.fn()}
        sort="lastWatched"
        filter="All"
        onSort={jest.fn()}
        onFilter={jest.fn()}
      />
    );

    expect(getByText("Sort by")).toBeTruthy();
    expect(getByText("Last watched")).toBeTruthy();
    expect(getByText("A to Z")).toBeTruthy();
    expect(getByText("Watch later")).toBeTruthy();
    expect(getByText("Stopped")).toBeTruthy();
  });
});
