import { posterColumnWidth } from "../posterColumnWidth";

describe("posterColumnWidth", () => {
  it("fits three posters with a 12 point gap", () => {
    expect(posterColumnWidth(375)).toBeCloseTo((375 - 40 - 24) / 3);
    expect(posterColumnWidth(430)).toBeGreaterThan(posterColumnWidth(375));
  });
});
