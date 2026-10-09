import * as Haptics from "expo-haptics";

import { playTickHaptic } from "../tickHaptic";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

describe("playTickHaptic", () => {
  it("plays a light haptic", () => {
    playTickHaptic();
    expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  });
});
