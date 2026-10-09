import { headerTitleFrame } from "../headerTitleFrame";

describe("headerTitleFrame", () => {
  it("keeps a centred title clear of a round button on both sides", () => {
    expect(headerTitleFrame(402, "icon")).toEqual({
      width: 402,
      paddingLeft: 68,
      paddingRight: 68,
    });
  });

  it("leaves a wider gap on the right for a text button", () => {
    const frame = headerTitleFrame(375, "label");
    expect(frame.width).toBe(375);
    expect(frame.paddingLeft).toBe(68);
    expect(frame.paddingRight).toBeGreaterThan(frame.paddingLeft);
    expect(
      frame.width - frame.paddingLeft - frame.paddingRight
    ).toBeGreaterThan(60);
  });
});
