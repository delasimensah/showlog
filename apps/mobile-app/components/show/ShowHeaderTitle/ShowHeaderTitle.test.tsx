import { render } from "@testing-library/react-native";
import { useSharedValue } from "react-native-reanimated";

import ShowHeaderTitle from "./ShowHeaderTitle";

function Title() {
  const scrollY = useSharedValue(200);
  return <ShowHeaderTitle name="One Piece" scrollY={scrollY} threshold={200} />;
}

describe("ShowHeaderTitle", () => {
  it("shows the show name", () => {
    const { getByText } = render(<Title />);
    expect(getByText("One Piece")).toBeTruthy();
  });
});
