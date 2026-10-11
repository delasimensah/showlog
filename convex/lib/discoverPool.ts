const MIN_WEIGHT = 85;

const SHOW_STATUSES = [
  "Running",
  "Ended",
  "To Be Determined",
  "In Development",
] as const;

type ShowStatus = (typeof SHOW_STATUSES)[number];

export interface PoolShow {
  tvmazeId: number;
  name: string;
  posterUrl: string;
  genres: string[];
  type?: string;
  language?: string;
  premieredYear?: number;
  status: ShowStatus;
  rating?: number;
  network?: string;
  weight: number;
  isAnime: boolean;
  refreshId: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function posterUrl(image: unknown): string | undefined {
  if (!isRecord(image)) return undefined;
  return readString(image.original) ?? readString(image.medium);
}

function readStatus(value: unknown): ShowStatus {
  if (
    typeof value === "string" &&
    SHOW_STATUSES.some((status) => status === value)
  ) {
    return value as ShowStatus;
  }
  return "To Be Determined";
}

function withoutEmpty<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined)
  ) as T;
}

export function isAnimeShow(show: {
  genres: string[];
  type?: string;
  language?: string;
}): boolean {
  if (show.genres.includes("Anime")) return true;
  return show.type === "Animation" && show.language === "Japanese";
}

/** Keeps shows popular enough to suggest, and only when they have a poster. */
export function toPoolShows(payload: unknown, refreshId: number): PoolShow[] {
  if (!Array.isArray(payload)) return [];
  const shows: PoolShow[] = [];
  for (const entry of payload) {
    if (!isRecord(entry)) continue;
    const tvmazeId = readNumber(entry.id);
    const name = readString(entry.name);
    const poster = posterUrl(entry.image);
    const weight = readNumber(entry.weight);
    if (
      tvmazeId === undefined ||
      name === undefined ||
      poster === undefined ||
      weight === undefined ||
      weight < MIN_WEIGHT
    ) {
      continue;
    }
    const genres = Array.isArray(entry.genres)
      ? entry.genres.filter(
          (genre): genre is string => typeof genre === "string"
        )
      : [];
    const type = readString(entry.type);
    const language = readString(entry.language);
    const premiered = readString(entry.premiered);
    const year =
      premiered === undefined ? undefined : Number(premiered.slice(0, 4));
    const rating = isRecord(entry.rating)
      ? readNumber(entry.rating.average)
      : undefined;
    const network = isRecord(entry.network)
      ? readString(entry.network.name)
      : isRecord(entry.webChannel)
        ? readString(entry.webChannel.name)
        : undefined;
    shows.push(
      withoutEmpty({
        tvmazeId,
        name,
        posterUrl: poster,
        genres,
        type,
        language,
        premieredYear:
          year !== undefined && Number.isInteger(year) && year > 0
            ? year
            : undefined,
        status: readStatus(entry.status),
        rating,
        network,
        weight,
        isAnime: isAnimeShow({ genres, type, language }),
        refreshId,
      })
    );
  }
  return shows;
}
