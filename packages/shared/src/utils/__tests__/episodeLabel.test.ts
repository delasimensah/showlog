import {
  airedMeta,
  airsMeta,
  countdownText,
  episodeLabel,
  episodeSeasonLine,
  formatAirDate,
} from "../episodeLabel";

describe("episodeLabel", () => {
  it("uses the season and episode for a normal show", () => {
    expect(
      episodeLabel({ yearSeasons: false, season: 4, number: 11, order: 40 })
    ).toBe("S4 | E11");
    expect(
      episodeSeasonLine({ yearSeasons: false, season: 4, number: 11 })
    ).toBeNull();
  });

  it("uses the overall number and the year line for a year-season show", () => {
    expect(
      episodeLabel({
        yearSeasons: true,
        season: 2026,
        number: 25,
        order: 1180,
      })
    ).toBe("Episode 1180");
    expect(
      episodeSeasonLine({ yearSeasons: true, season: 2026, number: 25 })
    ).toBe("2026 · E25");
  });
});

describe("countdownText", () => {
  const now = new Date(2026, 0, 1, 12).getTime();

  it("counts whole days until the air date", () => {
    const airsAt = new Date(2026, 0, 6, 21).getTime();
    expect(countdownText(airsAt, now)).toBe("in 5 days");
  });

  it("shows the date when the episode is more than 30 days away", () => {
    const airsAt = new Date(2026, 2, 4, 21).getTime();
    expect(countdownText(airsAt, now)).toBe(formatAirDate(airsAt, now));
  });
});

describe("airedMeta", () => {
  it("includes the runtime when the episode has one", () => {
    const airsAt = new Date(2026, 0, 14, 21).getTime();
    const now = new Date(2026, 0, 20).getTime();
    expect(airedMeta(airsAt, now, 52)).toBe(
      `Aired ${formatAirDate(airsAt, now)} · 52 min`
    );
  });
});

describe("airsMeta", () => {
  it("names the weekday when the air time is known", () => {
    const airsAt = new Date(2026, 0, 2, 21).getTime();
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][new Date(airsAt).getDay()];
    expect(airsMeta(airsAt, true)).toContain(weekday);
  });
});
