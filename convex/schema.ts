import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const showStatus = v.union(
  v.literal("Running"),
  v.literal("Ended"),
  v.literal("To Be Determined"),
  v.literal("In Development")
);

const seasonSummary = v.object({
  number: v.number(),
  episodeCount: v.number(),
  firstOrder: v.number(),
});

export default defineSchema({
  ...authTables,
  shows: defineTable({
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
  }).index("by_tvmazeId", ["tvmazeId"]),
  episodes: defineTable({
    showId: v.id("shows"),
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
  })
    .index("by_show_order", ["showId", "order"])
    .index("by_show_season", ["showId", "season", "number"])
    .index("by_tvmazeId", ["tvmazeId"])
    .index("by_airsAt", ["airsAt"]),
  myShows: defineTable({
    userId: v.id("users"),
    showId: v.id("shows"),
    addedAt: v.number(),
    watchLater: v.boolean(),
    stoppedAt: v.optional(v.number()),
    airedCount: v.number(),
    watchedCount: v.number(),
    nextEpisodeId: v.optional(v.id("episodes")),
    waitingAfterNext: v.number(),
    lastWatchedAt: v.optional(v.number()),
    lastWatchedEpisodeId: v.optional(v.id("episodes")),
  })
    .index("by_user_show", ["userId", "showId"])
    .index("by_user_lastWatchedAt", ["userId", "lastWatchedAt"])
    .index("by_user_addedAt", ["userId", "addedAt"])
    .index("by_show", ["showId"]),
  watchedEpisodes: defineTable({
    userId: v.id("users"),
    showId: v.id("shows"),
    episodeId: v.id("episodes"),
    season: v.number(),
    watchedAt: v.number(),
    minutes: v.number(),
  })
    .index("by_user_episode", ["userId", "episodeId"])
    .index("by_user_show", ["userId", "showId"])
    .index("by_user_show_season", ["userId", "showId", "season"]),
  userStats: defineTable({
    userId: v.id("users"),
    episodesWatched: v.number(),
    minutesWatched: v.number(),
  }).index("by_user", ["userId"]),
});
