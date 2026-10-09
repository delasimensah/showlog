import { render } from "@testing-library/react-native";
import { useSharedValue } from "react-native-reanimated";

import ShowHeaderBackground from "./ShowHeaderBackground";

function Background() {
  const scrollY = useSharedValue(0);
  return <ShowHeaderBackground scrollY={scrollY} threshold={200} />;
}

describe("ShowHeaderBackground", () => {
  it("renders the page fill", () => {
    const { toJSON } = render(<Background />);
    expect(toJSON()).toBeTruthy();
  });
});
