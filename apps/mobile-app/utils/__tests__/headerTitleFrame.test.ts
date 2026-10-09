import { headerTitleFrame } from "../headerTitleFrame";

describe("headerTitleFrame", () => {
  it("fits the gap between a round button on each side", () => {
    expect(headerTitleFrame(402, "icon")).toEqual({ width: 266 });
    expect(headerTitleFrame(375, "icon")).toEqual({ width: 239 });
  });

  it("leaves a wider gap on the right for a text button", () => {
    const frame = headerTitleFrame(375, "label");
    expect(frame.width).toBe(375);
    expect(frame.paddingLeft).toBe(68);
    expect(frame.paddingRight).toBeGreaterThan(frame.paddingLeft ?? 0);
  });
});
