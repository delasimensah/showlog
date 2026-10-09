import { render } from "@testing-library/react-native";

import ProgressBar from "./ProgressBar";

describe("ProgressBar", () => {
  it("fills the watched share of the track", () => {
    const { toJSON } = render(<ProgressBar value={0.5} />);
    const track = toJSON();
    if (track === null || Array.isArray(track) || !track.children) {
      throw new Error("Progress bar did not render");
    }
    const fill = track.children[0];
    if (fill === null || typeof fill === "string" || Array.isArray(fill)) {
      throw new Error("Progress fill did not render");
    }
    expect(fill.props.style).toEqual(expect.objectContaining({ width: "50%" }));
  });
});
