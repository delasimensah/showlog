import { render } from "@testing-library/react-native";

import Poster from "./Poster";

describe("Poster", () => {
  it("shows the picture when there is one", () => {
    const { getByLabelText } = render(
      <Poster
        uri="https://img.example/poster.jpg"
        accessibilityLabel="One Piece poster"
      />
    );
    expect(getByLabelText("One Piece poster")).toBeTruthy();
  });

  it("shows the TV mark when the picture is missing", () => {
    const { getByLabelText } = render(
      <Poster accessibilityLabel="Show poster" />
    );
    expect(getByLabelText("Show poster")).toBeTruthy();
  });
});
