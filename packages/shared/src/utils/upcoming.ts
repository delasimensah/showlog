const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export interface UpcomingAirTime {
  airsAt: number;
  airTimeKnown: boolean;
}

export interface UpcomingSection<T> {
  title: string;
  /** "9 Oct" beside Today, Tomorrow, or a weekday. A dated heading has none. */
  date: string | null;
  rows: T[];
}

/** The query clock. The list stays the same until the next hour. */
export function hourStart(time: number) {
  return Math.floor(time / HOUR_MS) * HOUR_MS;
}

/**
 * Groups unaired episodes by the day they air. Today, Tomorrow, and the
 * remaining days of this week (Sunday through Saturday) keep those names.
 * Every later day is its own heading, "11 Oct". A date with no time stays
 * on that calendar date. The week uses `timeZone`.
 */
export function upcomingSections<T extends UpcomingAirTime>(
  episodes: T[],
  now: number,
  timeZone: string
): UpcomingSection<T>[] {
  const todayKey = zonedKey(now, timeZone);
  const sorted = [...episodes].sort((left, right) => {
    const byDay = episodeKey(left, timeZone).localeCompare(
      episodeKey(right, timeZone)
    );
    if (byDay !== 0) return byDay;
    return left.airsAt - right.airsAt;
  });

  const sections: UpcomingSection<T>[] = [];
  for (const episode of sorted) {
    const key = episodeKey(episode, timeZone);
    const title = groupTitle(key, todayKey);
    const current = sections[sections.length - 1];
    if (current === undefined || current.title !== title) {
      const named = title !== formatKeyDate(key, todayKey);
      sections.push({
        title,
        date: named ? formatKeyDate(key, todayKey) : null,
        rows: [episode],
      });
    } else {
      current.rows.push(episode);
    }
  }
  return sections;
}

/** The clock time on a row, or "Time TBA" when only the date is known. */
export function upcomingDetail(
  episode: UpcomingAirTime,
  timeZone: string,
  locale?: string
) {
  if (!episode.airTimeKnown) return "Time TBA";
  return formatAirTime(episode.airsAt, timeZone, locale);
}

export function formatAirTime(
  airsAt: number,
  timeZone: string,
  locale?: string
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(airsAt);
}

function groupTitle(key: string, todayKey: string) {
  const days = daysBetween(todayKey, key);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  const todayDow = new Date(`${todayKey}T00:00:00.000Z`).getUTCDay();
  const untilSaturday = (6 - todayDow + 7) % 7;
  if (days <= untilSaturday) {
    const episodeDow = new Date(`${key}T00:00:00.000Z`).getUTCDay();
    return WEEKDAYS[episodeDow] ?? formatKeyDate(key, todayKey);
  }
  return formatKeyDate(key, todayKey);
}

function episodeKey(episode: UpcomingAirTime, timeZone: string) {
  if (!episode.airTimeKnown) return utcKey(episode.airsAt);
  return zonedKey(episode.airsAt, timeZone);
}

function zonedKey(time: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(time);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function utcKey(time: number) {
  const date = new Date(time);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

function daysBetween(fromKey: string, toKey: string) {
  const from = Date.parse(`${fromKey}T00:00:00.000Z`);
  const to = Date.parse(`${toKey}T00:00:00.000Z`);
  return Math.round((to - from) / DAY_MS);
}

/** "9 Oct", plus the year when it is not the year of today. */
function formatKeyDate(key: string, todayKey: string) {
  const [year, month, day] = key.split("-").map(Number);
  const label = `${day} ${MONTHS[(month ?? 1) - 1]}`;
  if (key.slice(0, 4) === todayKey.slice(0, 4)) return label;
  return `${label} ${year}`;
}
