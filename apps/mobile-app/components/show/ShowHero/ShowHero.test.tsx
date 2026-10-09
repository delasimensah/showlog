import { render } from "@testing-library/react-native";

import ShowHero from "./ShowHero";

describe("ShowHero", () => {
  it("shows the name and the meta line", () => {
    const { getByText } = render(
      <ShowHero width={320} name="One Piece" meta="2 seasons · Fuji TV" />
    );
    expect(getByText("One Piece")).toBeTruthy();
    expect(getByText("2 seasons · Fuji TV")).toBeTruthy();
  });
});
