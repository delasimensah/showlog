import { fillOpacity } from "../showHeaderFade";

describe("fillOpacity", () => {
  it("stays clear before the fade and full at the threshold", () => {
    expect(fillOpacity(0, 200)).toBe(0);
    expect(fillOpacity(200, 200)).toBe(1);
  });
});
