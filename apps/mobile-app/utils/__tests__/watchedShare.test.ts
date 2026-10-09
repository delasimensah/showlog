import { watchedShare } from "../watchedShare";

describe("watchedShare", () => {
  it("returns the watched share, and zero when nothing has aired", () => {
    expect(watchedShare(5, 20)).toBe(0.25);
    expect(watchedShare(0, 0)).toBe(0);
  });
});
