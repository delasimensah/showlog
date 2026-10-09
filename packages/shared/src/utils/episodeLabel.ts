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

function startOfLocalDay(time: number) {
  const date = new Date(time);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

export function episodeLabel(input: {
  yearSeasons: boolean;
  season: number;
  number: number;
  order: number;
}) {
  if (input.yearSeasons) return `Episode ${input.order}`;
  return `S${input.season} | E${input.number}`;
}

export function episodeSeasonLine(input: {
  yearSeasons: boolean;
  season: number;
  number: number;
}) {
  if (!input.yearSeasons) return null;
  return `${input.season} · E${input.number}`;
}

export function formatAirDate(airsAt: number, now: number) {
  const date = new Date(airsAt);
  const day = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  if (date.getFullYear() === new Date(now).getFullYear()) return day;
  return `${day} ${date.getFullYear()}`;
}

export function countdownText(airsAt: number, now: number) {
  const days = Math.round(
    (startOfLocalDay(airsAt) - startOfLocalDay(now)) / DAY_MS
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 30) return `in ${days} days`;
  return formatAirDate(airsAt, now);
}

export function airedMeta(
  airsAt: number | undefined,
  now: number,
  minutes: number | null
) {
  if (airsAt === undefined) return "No date yet";
  const date = `Aired ${formatAirDate(airsAt, now)}`;
  if (minutes === null || minutes <= 0) return date;
  return `${date} · ${minutes} min`;
}

export function airsMeta(airsAt: number, airTimeKnown: boolean) {
  if (!airTimeKnown) return `Airs ${formatAirDate(airsAt, airsAt)}`;
  const date = new Date(airsAt);
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `Airs ${WEEKDAYS[date.getDay()]} ${time}`;
}
