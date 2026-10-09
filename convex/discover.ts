import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalAction, internalMutation } from "./_generated/server";
import { authedQuery } from "./lib/functions";
import { fetchJson } from "./tvmaze";

const MIN_WEIGHT = 85;
const TOP_RATING = 8;
const ROW_LIMIT = 100;
const RATING_SCAN = 2000;
const PAGES_PER_RUN = 15;
const NEXT_PAGE_MS = 10_000;
const STALE_BATCH = 500;

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

const poolShow = v.object({
  tvmazeId: v.number(),
  name: v.string(),
  posterUrl: v.string(),
  genres: v.array(v.string()),
  type: v.optional(v.string()),
  language: v.optional(v.string()),
  premieredYear: v.optional(v.number()),
  status: v.union(
    v.literal("Running"),
    v.literal("Ended"),
    v.literal("To Be Determined"),
    v.literal("In Development")
  ),
  rating: v.optional(v.number()),
  network: v.optional(v.string()),
  weight: v.number(),
  isAnime: v.boolean(),
  refreshId: v.number(),
});

const discoverCard = v.object({
  tvmazeId: v.number(),
  name: v.string(),
  posterUrl: v.string(),
  year: v.union(v.number(), v.null()),
});

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

export function isAnimeShow(show: {
  genres: string[];
  type?: string;
  language?: string;
}): boolean {
  if (show.genres.includes("Anime")) return true;
  return show.type === "Animation" && show.language === "Japanese";
}

function withoutEmpty<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined)
  ) as T;
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

function isMissingPage(error: unknown): boolean {
  return error instanceof Error && error.message.includes("(404)");
}

export const refreshPool = internalAction({
  args: {
    page: v.optional(v.number()),
    refreshId: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const refreshId = args.refreshId ?? Date.now();
    let page = args.page ?? 0;

    for (let index = 0; index < PAGES_PER_RUN; index += 1) {
      let payload: unknown;
      try {
        payload = await fetchJson(`/shows?page=${page}`);
      } catch (error) {
        if (!isMissingPage(error)) throw error;
        await ctx.runMutation(internal.discover.dropStale, { refreshId });
        return null;
      }
      const suggestions = toPoolShows(payload, refreshId);
      if (suggestions.length > 0) {
        await ctx.runMutation(internal.discover.upsertSuggestions, {
          suggestions,
        });
      }
      page += 1;
    }

    await ctx.scheduler.runAfter(NEXT_PAGE_MS, internal.discover.refreshPool, {
      page,
      refreshId,
    });
    return null;
  },
});

export const upsertSuggestions = internalMutation({
  args: { suggestions: v.array(poolShow) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const suggestion of args.suggestions) {
      const existing = await ctx.db
        .query("suggestedShows")
        .withIndex("by_tvmazeId", (q) => q.eq("tvmazeId", suggestion.tvmazeId))
        .unique();
      if (existing === null) {
        await ctx.db.insert("suggestedShows", suggestion);
      } else {
        await ctx.db.patch(existing._id, suggestion);
      }
    }
    return null;
  },
});

export const dropStale = internalMutation({
  args: { refreshId: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stale = await ctx.db
      .query("suggestedShows")
      .withIndex("by_refreshId", (q) => q.lt("refreshId", args.refreshId))
      .take(STALE_BATCH);
    for (const row of stale) await ctx.db.delete(row._id);
    if (stale.length === STALE_BATCH) {
      await ctx.scheduler.runAfter(0, internal.discover.dropStale, {
        refreshId: args.refreshId,
      });
    }
    return null;
  },
});

function card(show: Doc<"suggestedShows">) {
  return {
    tvmazeId: show.tvmazeId,
    name: show.name,
    posterUrl: show.posterUrl,
    year: show.premieredYear ?? null,
  };
}

function topMatches(
  ranked: Doc<"suggestedShows">[],
  listed: Set<number>,
  match: (show: Doc<"suggestedShows">) => boolean
) {
  const picked = [];
  for (const show of ranked) {
    if (listed.has(show.tvmazeId) || !match(show)) continue;
    picked.push(card(show));
    if (picked.length === ROW_LIMIT) break;
  }
  return picked;
}

function commonGenres(shows: Doc<"shows">[]): string[] {
  const counts = new Map<string, number>();
  for (const show of shows) {
    for (const genre of show.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
    )
    .slice(0, 2)
    .map(([genre]) => genre);
}

async function myCopies(ctx: QueryCtx, userId: Doc<"myShows">["userId"]) {
  const rows = await ctx.db
    .query("myShows")
    .withIndex("by_user_addedAt", (q) => q.eq("userId", userId))
    .collect();
  const shows: Doc<"shows">[] = [];
  for (const row of rows) {
    const show = await ctx.db.get(row.showId);
    if (show !== null) shows.push(show);
  }
  return shows;
}

export const rows = authedQuery({
  args: {},
  returns: v.array(
    v.object({
      title: v.string(),
      shows: v.array(discoverCard),
    })
  ),
  handler: async (ctx) => {
    const mine = await myCopies(ctx, ctx.userId);
    const listed = new Set(mine.map((show) => show.tvmazeId));
    const ranked = await ctx.db
      .query("suggestedShows")
      .withIndex("by_rating")
      .order("desc")
      .take(RATING_SCAN);

    const topRated = () =>
      topMatches(
        ranked,
        listed,
        (show) => show.rating !== undefined && show.rating >= TOP_RATING
      );

    if (mine.length === 0) {
      return [
        {
          title: "Popular anime",
          shows: topMatches(ranked, listed, (show) => show.isAnime),
        },
        {
          title: "Popular right now",
          shows: topMatches(
            ranked,
            listed,
            (show) => show.status === "Running"
          ),
        },
        { title: "Top rated", shows: topRated() },
      ];
    }

    const built: { title: string; shows: ReturnType<typeof card>[] }[] = [];
    if (mine.some((show) => isAnimeShow(show))) {
      built.push({
        title: "Because you watch anime",
        shows: topMatches(ranked, listed, (show) => show.isAnime),
      });
    }
    for (const genre of commonGenres(mine)) {
      built.push({
        title: `More ${genre}`,
        shows: topMatches(ranked, listed, (show) =>
          show.genres.includes(genre)
        ),
      });
    }
    built.push({ title: "Top rated", shows: topRated() });
    return built;
  },
});
