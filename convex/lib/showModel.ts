import { v } from "convex/values";

const seasonSummary = v.object({
  number: v.number(),
  episodeCount: v.number(),
  firstOrder: v.number(),
});

export const EPISODE_BATCH_SIZE = 500;

export const showStatus = v.union(
  v.literal("Running"),
  v.literal("Ended"),
  v.literal("To Be Determined"),
  v.literal("In Development")
);

export const showFields = {
  tvmazeId: v.number(),
  name: v.string(),
  type: v.optional(v.string()),
  language: v.optional(v.string()),
  genres: v.array(v.string()),
  status: showStatus,
  network: v.optional(v.string()),
  networkTimeZone: v.optional(v.string()),
  premiered: v.optional(v.string()),
  averageRuntime: v.optional(v.number()),
  rating: v.optional(v.number()),
  summary: v.optional(v.string()),
  posterUrl: v.optional(v.string()),
  headerUrl: v.optional(v.string()),
  seasons: v.array(seasonSummary),
  yearSeasons: v.boolean(),
  tvmazeUpdatedAt: v.number(),
};

export const episodeFields = {
  tvmazeId: v.number(),
  season: v.number(),
  number: v.number(),
  order: v.number(),
  name: v.string(),
  summary: v.optional(v.string()),
  runtime: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  airsAt: v.optional(v.number()),
  airTimeKnown: v.boolean(),
};

export function chunkEpisodes<T>(
  episodes: T[],
  size = EPISODE_BATCH_SIZE
): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < episodes.length; index += size) {
    batches.push(episodes.slice(index, index + size));
  }
  return batches;
}
