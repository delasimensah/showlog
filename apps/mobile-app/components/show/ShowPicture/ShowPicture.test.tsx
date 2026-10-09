import { render } from "@testing-library/react-native";
import { useSharedValue } from "react-native-reanimated";

import ShowPicture from "./ShowPicture";

function Picture({ uri }: { uri: string | null }) {
  const scrollY = useSharedValue(0);
  return <ShowPicture uri={uri} width={320} scrollY={scrollY} />;
}

describe("ShowPicture", () => {
  it("shows the header picture", () => {
    const { getByLabelText } = render(
      <Picture uri="https://img.example/header.jpg" />
    );
    expect(getByLabelText("Show header")).toBeTruthy();
  });

  it("shows the tv mark when there is no picture", () => {
    const { getByText } = render(<Picture uri={null} />);
    expect(getByText("tv")).toBeTruthy();
  });
});
