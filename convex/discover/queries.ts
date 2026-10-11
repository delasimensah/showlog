import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { isAnimeShow } from "../lib/discoverPool";
import { authedQuery } from "../lib/functions";

const TOP_RATING = 8;
const ROW_LIMIT = 100;
const RATING_SCAN = 2000;

const discoverCard = v.object({
  tvmazeId: v.number(),
  name: v.string(),
  posterUrl: v.string(),
  year: v.union(v.number(), v.null()),
});

const tasteShape = v.object({
  listed: v.array(v.number()),
  genres: v.array(v.string()),
  watchesAnime: v.boolean(),
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

/**
 * What Discover needs to know about my list. It is a separate query so that
 * `rows`, which scans the whole pool, never reads my list and does not run
 * again every time I tick an episode.
 */
export const taste = authedQuery({
  args: {},
  returns: tasteShape,
  handler: async (ctx) => {
    const mine = await myCopies(ctx, ctx.userId);
    return {
      listed: mine.map((show) => show.tvmazeId).sort((a, b) => a - b),
      genres: commonGenres(mine),
      watchesAnime: mine.some((show) => isAnimeShow(show)),
    };
  },
});

export const rows = authedQuery({
  args: tasteShape.fields,
  returns: v.array(
    v.object({
      title: v.string(),
      shows: v.array(discoverCard),
    })
  ),
  handler: async (ctx, args) => {
    const listed = new Set(args.listed);
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

    if (args.listed.length === 0) {
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
    if (args.watchesAnime) {
      built.push({
        title: "Because you watch anime",
        shows: topMatches(ranked, listed, (show) => show.isAnime),
      });
    }
    for (const genre of args.genres) {
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
