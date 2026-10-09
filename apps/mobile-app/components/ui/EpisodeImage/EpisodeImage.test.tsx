import { render } from "@testing-library/react-native";

import EpisodeImage from "./EpisodeImage";

describe("EpisodeImage", () => {
  it("shows the picture when there is one", () => {
    const { getByLabelText } = render(
      <EpisodeImage uri="https://img.example/episode.jpg" />
    );
    expect(getByLabelText("Episode picture")).toBeTruthy();
  });

  it("shows the tv mark when the picture is missing", () => {
    const { getByText } = render(<EpisodeImage uri={null} />);
    expect(getByText("tv")).toBeTruthy();
  });
});
