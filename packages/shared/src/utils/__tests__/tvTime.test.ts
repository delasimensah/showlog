import { tvTime } from "../tvTime";

const hour = 60;
const day = 24 * hour;
const month = 30 * day;

describe("tvTime", () => {
  it("reads months, days, and hours", () => {
    expect(tvTime(8 * month + day + 12 * hour)).toBe("8 months 1 day 12 hours");
    expect(tvTime(hour)).toBe("0 months 0 days 1 hour");
    expect(tvTime(month)).toBe("1 month 0 days 0 hours");
  });

  it("drops minutes under an hour and treats a missing total as zero", () => {
    expect(tvTime(59)).toBe("0 months 0 days 0 hours");
    expect(tvTime(0)).toBe("0 months 0 days 0 hours");
  });
});
