import { fireEvent, render } from "@testing-library/react-native";

import ShowPreview from "./ShowPreview";

const show = {
  tvmazeId: 44702,
  name: "One Piece",
  genres: ["Action"],
  status: "Running",
  seasonCount: 2,
  summary: "Live action pirates.",
  network: "Netflix",
  rating: 8.7,
};

describe("ShowPreview", () => {
  it("shows Add for a show that is not on the list", () => {
    const onAdd = jest.fn();
    const { getByText } = render(
      <ShowPreview show={show} width={320} adding={false} onAdd={onAdd} />
    );

    fireEvent.press(getByText("Add to my list"));
    expect(onAdd).toHaveBeenCalled();
  });
});
