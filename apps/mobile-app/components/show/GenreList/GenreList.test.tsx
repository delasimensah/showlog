import { render } from "@testing-library/react-native";

import GenreList from "./GenreList";

describe("GenreList", () => {
  it("shows a chip for each genre", () => {
    const { getByText } = render(
      <GenreList genres={["Action", "Adventure"]} />
    );
    expect(getByText("Action")).toBeTruthy();
    expect(getByText("Adventure")).toBeTruthy();
  });
});
