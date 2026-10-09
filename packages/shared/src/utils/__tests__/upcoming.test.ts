import {
  formatAirTime,
  hourStart,
  upcomingDetail,
  upcomingSections,
} from "../upcoming";

const LOS_ANGELES = "America/Los_Angeles";
const ACCRA = "Africa/Accra";

describe("upcomingSections", () => {
  it("splits midnight into Today and Tomorrow in the phone's time zone", () => {
    const now = Date.parse("2026-10-10T05:30:00.000Z");
    const sections = upcomingSections(
      [
        {
          id: "tonight",
          airsAt: Date.parse("2026-10-10T06:00:00.000Z"),
          airTimeKnown: true,
        },
        {
          id: "after",
          airsAt: Date.parse("2026-10-10T07:30:00.000Z"),
          airTimeKnown: true,
        },
      ],
      now,
      LOS_ANGELES
    );

    expect(sections.map((section) => section.title)).toEqual([
      "Today",
      "Tomorrow",
    ]);
    expect(sections[0]?.rows.map((row) => row.id)).toEqual(["tonight"]);
    expect(sections[1]?.rows.map((row) => row.id)).toEqual(["after"]);
  });

  it("keeps Saturday in this week and gives Sunday its own date", () => {
    const now = Date.parse("2026-10-07T12:00:00.000Z");
    const sections = upcomingSections(
      [
        {
          id: "tomorrow",
          airsAt: Date.parse("2026-10-08T15:00:00.000Z"),
          airTimeKnown: true,
        },
        {
          id: "saturday",
          airsAt: Date.parse("2026-10-10T15:00:00.000Z"),
          airTimeKnown: true,
        },
        {
          id: "sunday",
          airsAt: Date.parse("2026-10-11T15:00:00.000Z"),
          airTimeKnown: true,
        },
      ],
      now,
      ACCRA
    );

    expect(sections.map((section) => section.title)).toEqual([
      "Tomorrow",
      "Saturday",
      "11 Oct",
    ]);
    expect(sections.map((section) => section.date)).toEqual([
      "8 Oct",
      "10 Oct",
      null,
    ]);
    expect(upcomingDetail(sections[2]!.rows[0]!, ACCRA, "en-US")).toBe(
      "3:00 PM"
    );
  });

  it("keeps a date-only episode on its air date", () => {
    const now = Date.parse("2026-10-07T19:00:00.000Z");
    const episode = {
      id: "dated",
      airsAt: Date.parse("2026-10-10T00:00:00.000Z"),
      airTimeKnown: false,
    };
    const sections = upcomingSections([episode], now, LOS_ANGELES);

    expect(sections.map((section) => section.title)).toEqual(["Saturday"]);
    expect(sections[0]?.date).toBe("10 Oct");
    expect(upcomingDetail(episode, LOS_ANGELES)).toBe("Time TBA");
  });
});

describe("formatAirTime", () => {
  it("uses the phone's time zone", () => {
    expect(
      formatAirTime(
        Date.parse("2026-10-09T20:00:00.000Z"),
        "America/New_York",
        "en-US"
      )
    ).toBe("4:00 PM");
  });
});

describe("hourStart", () => {
  it("rounds down to the hour", () => {
    const now = Date.parse("2026-10-09T20:40:00.000Z");
    expect(hourStart(now)).toBe(Date.parse("2026-10-09T20:00:00.000Z"));
  });
});
