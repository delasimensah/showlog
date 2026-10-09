import { pickFromPool } from "../pickFromPool";

const shows = Array.from({ length: 25 }, (_, index) => index);

describe("pickFromPool", () => {
  it("keeps the same 20 shows for the same seed", () => {
    expect(pickFromPool(shows, 4)).toEqual(pickFromPool(shows, 4));
    expect(pickFromPool(shows, 4)).toHaveLength(20);
  });

  it("changes the row when the seed changes", () => {
    expect(pickFromPool(shows, 4)).not.toEqual(pickFromPool(shows, 9));
  });
});
