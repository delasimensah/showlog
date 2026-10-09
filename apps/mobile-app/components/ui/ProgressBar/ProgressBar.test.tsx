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
    expect(fill.props.className).toContain("bg-primary");
  });

  it("uses blue for Watch later and red for Stopped", () => {
    const later = render(<ProgressBar value={0.5} tone="later" />).toJSON();
    const stopped = render(<ProgressBar value={0.5} tone="stopped" />).toJSON();
    if (
      later === null ||
      Array.isArray(later) ||
      stopped === null ||
      Array.isArray(stopped)
    ) {
      throw new Error("Progress bar did not render");
    }
    const laterFill = later.children?.[0];
    const stoppedFill = stopped.children?.[0];
    if (
      laterFill == null ||
      typeof laterFill === "string" ||
      Array.isArray(laterFill) ||
      stoppedFill == null ||
      typeof stoppedFill === "string" ||
      Array.isArray(stoppedFill)
    ) {
      throw new Error("Progress fill did not render");
    }
    expect(laterFill.props.className).toContain("bg-later");
    expect(stoppedFill.props.className).toContain("bg-danger");
  });
});
