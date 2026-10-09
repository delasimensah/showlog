import { keepDayShows } from "../dayShows";

const day = "2026-10-09";
const shows = Array.from({ length: 25 }, (_, index) => ({ tvmazeId: index }));

describe("keepDayShows", () => {
  it("picks the same 20 for the same day", () => {
    const first = keepDayShows(undefined, shows, day);
    expect(keepDayShows(first, shows, day)).toBe(first);
    expect(first).toHaveLength(20);
  });

  it("keeps posters already on screen when the pool grows", () => {
    const early = keepDayShows(undefined, shows.slice(0, 5), day);
    const later = keepDayShows(early, shows, day);

    expect(later.slice(0, 5)).toEqual(early);
    expect(later).toHaveLength(20);
  });

  it("does not swap a full row when newer shows arrive", () => {
    const first = keepDayShows(undefined, shows, day);
    const withNewcomer = [{ tvmazeId: 99 }, ...shows];
    expect(keepDayShows(first, withNewcomer, day)).toEqual(first);
  });

  it("drops a show that left the row and picks a different set tomorrow", () => {
    const first = keepDayShows(undefined, shows, day);
    const gone = shows.filter((show) => show.tvmazeId !== first[0]?.tvmazeId);
    const today = keepDayShows(first, gone, day);
    expect(today.map((show) => show.tvmazeId)).not.toContain(
      first[0]?.tvmazeId
    );

    const tomorrow = keepDayShows(undefined, shows, "2026-10-10");
    expect(tomorrow).not.toEqual(first);
  });
});
