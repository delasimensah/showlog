import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import RefreshableScroll from "./RefreshableScroll";

describe("RefreshableScroll", () => {
  it("renders the list and runs the pull", () => {
    const onRefresh = jest.fn();
    const { getByText, getByTestId } = render(
      <RefreshableScroll
        testID="watching-scroll"
        refreshing={false}
        onRefresh={onRefresh}
      >
        <Text>The Bear</Text>
      </RefreshableScroll>
    );

    expect(getByText("The Bear")).toBeTruthy();
    getByTestId("watching-scroll").props.refreshControl.props.onRefresh();
    expect(onRefresh).toHaveBeenCalled();
  });

  it("keeps a centred empty state out of the scrolling list", () => {
    const onRefresh = jest.fn();
    const { getByText, getByTestId } = render(
      <RefreshableScroll
        testID="watching-scroll"
        refreshing={false}
        onRefresh={onRefresh}
        centered
      >
        <Text>Add the shows you watch</Text>
      </RefreshableScroll>
    );

    expect(getByText("Add the shows you watch")).toBeTruthy();
    getByTestId("watching-scroll").props.refreshControl.props.onRefresh();
    expect(onRefresh).toHaveBeenCalled();
  });
});
