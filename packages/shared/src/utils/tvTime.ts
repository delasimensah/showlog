const HOURS_IN_DAY = 24;
const DAYS_IN_MONTH = 30;

export interface TvTimeParts {
  months: number;
  days: number;
  hours: number;
}

/** Months are 30 days. Minutes under an hour are left out. */
export function tvTimeParts(minutes: number): TvTimeParts {
  const safe =
    Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;
  const totalHours = Math.floor(safe / 60);
  const monthHours = DAYS_IN_MONTH * HOURS_IN_DAY;
  return {
    months: Math.floor(totalHours / monthHours),
    days: Math.floor((totalHours % monthHours) / HOURS_IN_DAY),
    hours: totalHours % HOURS_IN_DAY,
  };
}

function unit(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "8 months 1 day 12 hours". */
export function tvTime(minutes: number): string {
  const parts = tvTimeParts(minutes);
  return [
    unit(parts.months, "month", "months"),
    unit(parts.days, "day", "days"),
    unit(parts.hours, "hour", "hours"),
  ].join(" ");
}
