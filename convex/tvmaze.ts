const API_ROOT = "https://api.tvmaze.com";
const USER_AGENT =
  "Showlog/1.0 (personal app; github.com/delasimensah/showlog)";
const MAX_TRIES = 3;
const DEFAULT_RETRY_SECONDS = 5;

export const SHOW_STATUSES = [
  "Running",
  "Ended",
  "To Be Determined",
  "In Development",
] as const;

export type ShowStatus = (typeof SHOW_STATUSES)[number];

export interface SeasonCopy {
  number: number;
  episodeCount: number;
  firstOrder: number;
}

export interface ShowCopy {
  tvmazeId: number;
  name: string;
  type?: string;
  language?: string;
  genres: string[];
  status: ShowStatus;
  network?: string;
  networkTimeZone?: string;
  premiered?: string;
  averageRuntime?: number;
  rating?: number;
  summary?: string;
  posterUrl?: string;
  headerUrl?: string;
  seasons: SeasonCopy[];
  yearSeasons: boolean;
  tvmazeUpdatedAt: number;
}

export interface EpisodeCopy {
  tvmazeId: number;
  season: number;
  number: number;
  order: number;
  name: string;
  summary?: string;
  runtime?: number;
  imageUrl?: string;
  airsAt?: number;
  airTimeKnown: boolean;
}

export interface SearchHit {
  tvmazeId: number;
  name: string;
  posterUrl: string | null;
  type: string | null;
  language: string | null;
  year: number | null;
  network: string | null;
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

export function stripHtml(
  value: string | null | undefined
): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : undefined;
}

function pictureUrl(image: unknown): string | undefined {
  if (!isRecord(image)) return undefined;
  const direct = readString(image.original) ?? readString(image.medium);
  if (direct !== undefined) return direct;
  if (!isRecord(image.resolutions)) return undefined;
  const original = image.resolutions.original;
  const medium = image.resolutions.medium;
  if (isRecord(original)) {
    const url = readString(original.url);
    if (url !== undefined) return url;
  }
  if (isRecord(medium)) return readString(medium.url);
  return undefined;
}

function headerPicture(
  show: Record<string, unknown>,
  posterUrl: string | undefined
): string | undefined {
  const embedded = isRecord(show._embedded) ? show._embedded : undefined;
  const images =
    embedded && Array.isArray(embedded.images) ? embedded.images : [];
  const backgrounds = images.filter(
    (image): image is Record<string, unknown> =>
      isRecord(image) && image.type === "background"
  );
  const main = backgrounds.find((image) => image.main === true);
  return pictureUrl(main) ?? pictureUrl(backgrounds[0]) ?? posterUrl;
}

function channel(
  show: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (isRecord(show.network)) return show.network;
  if (isRecord(show.webChannel)) return show.webChannel;
  return undefined;
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

function updatedAt(value: unknown): number {
  const updated = readNumber(value);
  if (updated === undefined) return 0;
  return updated < 1_000_000_000_000 ? updated * 1000 : updated;
}

function episodeAir(episode: Record<string, unknown>): {
  airsAt?: number;
  airTimeKnown: boolean;
} {
  const airstamp = readString(episode.airstamp);
  if (airstamp !== undefined) {
    const airsAt = Date.parse(airstamp);
    if (Number.isFinite(airsAt)) return { airsAt, airTimeKnown: true };
  }
  const airdate = readString(episode.airdate);
  if (airdate !== undefined) {
    const airsAt = Date.parse(`${airdate}T00:00:00.000Z`);
    if (Number.isFinite(airsAt)) return { airsAt, airTimeKnown: false };
  }
  return { airTimeKnown: false };
}

function isNumberedEpisode(episode: Record<string, unknown>): boolean {
  return episode.type === "regular" && typeof episode.number === "number";
}

function seasonsFrom(episodes: EpisodeCopy[]): {
  seasons: SeasonCopy[];
  yearSeasons: boolean;
} {
  const seasons: SeasonCopy[] = [];
  for (const episode of episodes) {
    const current = seasons[seasons.length - 1];
    if (current === undefined || current.number !== episode.season) {
      seasons.push({
        number: episode.season,
        episodeCount: 1,
        firstOrder: episode.order,
      });
    } else {
      current.episodeCount += 1;
    }
  }
  return {
    seasons,
    yearSeasons: seasons.some((season) => season.number >= 1900),
  };
}

export function toEpisodeCopies(episodes: unknown): EpisodeCopy[] {
  if (!Array.isArray(episodes)) return [];
  const copies: EpisodeCopy[] = [];
  for (const episode of episodes) {
    if (!isRecord(episode) || !isNumberedEpisode(episode)) continue;
    const tvmazeId = readNumber(episode.id);
    const season = readNumber(episode.season);
    const number = readNumber(episode.number);
    if (
      tvmazeId === undefined ||
      season === undefined ||
      number === undefined
    ) {
      continue;
    }
    const air = episodeAir(episode);
    const summary = stripHtml(
      typeof episode.summary === "string" ? episode.summary : undefined
    );
    copies.push({
      tvmazeId,
      season,
      number,
      order: copies.length + 1,
      name: readString(episode.name) ?? "Episode",
      ...(summary !== undefined ? { summary } : {}),
      ...(readNumber(episode.runtime) !== undefined
        ? { runtime: readNumber(episode.runtime) }
        : {}),
      ...(pictureUrl(episode.image) !== undefined
        ? { imageUrl: pictureUrl(episode.image) }
        : {}),
      ...(air.airsAt !== undefined ? { airsAt: air.airsAt } : {}),
      airTimeKnown: air.airTimeKnown,
    });
  }
  return copies;
}

export function toShowCopy(show: unknown, episodes: EpisodeCopy[]): ShowCopy {
  if (!isRecord(show)) throw new Error("TVmaze did not return this show");
  const tvmazeId = readNumber(show.id);
  const name = readString(show.name);
  if (tvmazeId === undefined || name === undefined) {
    throw new Error("TVmaze did not return this show");
  }
  const posterUrl = pictureUrl(show.image);
  const headerUrl = headerPicture(show, posterUrl);
  const source = channel(show);
  const timeZone =
    source !== undefined && isRecord(source.country)
      ? readString(source.country.timezone)
      : undefined;
  const rating = isRecord(show.rating)
    ? readNumber(show.rating.average)
    : undefined;
  const summary = stripHtml(
    typeof show.summary === "string" ? show.summary : undefined
  );
  const { seasons, yearSeasons } = seasonsFrom(episodes);
  return {
    tvmazeId,
    name,
    ...(readString(show.type) !== undefined
      ? { type: readString(show.type) }
      : {}),
    ...(readString(show.language) !== undefined
      ? { language: readString(show.language) }
      : {}),
    genres: Array.isArray(show.genres)
      ? show.genres.filter(
          (genre): genre is string => typeof genre === "string"
        )
      : [],
    status: readStatus(show.status),
    ...(source !== undefined && readString(source.name) !== undefined
      ? { network: readString(source.name) }
      : {}),
    ...(timeZone !== undefined ? { networkTimeZone: timeZone } : {}),
    ...(readString(show.premiered) !== undefined
      ? { premiered: readString(show.premiered) }
      : {}),
    ...(readNumber(show.averageRuntime) !== undefined
      ? { averageRuntime: readNumber(show.averageRuntime) }
      : {}),
    ...(rating !== undefined ? { rating } : {}),
    ...(summary !== undefined ? { summary } : {}),
    ...(posterUrl !== undefined ? { posterUrl } : {}),
    ...(headerUrl !== undefined ? { headerUrl } : {}),
    seasons,
    yearSeasons,
    tvmazeUpdatedAt: updatedAt(show.updated),
  };
}

export function copiesFromShowPayload(payload: unknown): {
  show: ShowCopy;
  episodes: EpisodeCopy[];
} {
  if (!isRecord(payload)) throw new Error("TVmaze did not return this show");
  const embedded = isRecord(payload._embedded)
    ? payload._embedded.episodes
    : [];
  const episodes = toEpisodeCopies(embedded);
  return { show: toShowCopy(payload, episodes), episodes };
}

function premieredYear(premiered: string | undefined): number | null {
  if (premiered === undefined) return null;
  const year = Number(premiered.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

export function toSearchHits(payload: unknown): SearchHit[] {
  if (!Array.isArray(payload)) return [];
  const hits: SearchHit[] = [];
  for (const entry of payload) {
    if (!isRecord(entry) || !isRecord(entry.show)) continue;
    const show = entry.show;
    const tvmazeId = readNumber(show.id);
    const name = readString(show.name);
    if (tvmazeId === undefined || name === undefined) continue;
    const premiered = readString(show.premiered);
    const source = channel(show);
    hits.push({
      tvmazeId,
      name,
      posterUrl: pictureUrl(show.image) ?? null,
      type: readString(show.type) ?? null,
      language: readString(show.language) ?? null,
      year: premieredYear(premiered),
      network: source !== undefined ? (readString(source.name) ?? null) : null,
    });
    if (hits.length === 10) break;
  }
  return hits;
}

function retrySeconds(response: Response): number {
  const header = Number(response.headers.get("Retry-After"));
  if (Number.isFinite(header) && header >= 0) return header;
  return DEFAULT_RETRY_SECONDS;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function fetchJson(path: string): Promise<unknown> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt += 1) {
    const response = await fetch(`${API_ROOT}${path}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (response.status !== 429) {
      if (!response.ok) {
        throw new Error(`TVmaze request failed (${response.status})`);
      }
      return await response.json();
    }
    if (attempt === MAX_TRIES - 1) break;
    await wait(retrySeconds(response) * 1000);
  }
  throw new Error("TVmaze is busy");
}
