import { describe, expect, it } from "vitest";

import { isAnimeShow, toPoolShows } from "../discoverPool";

describe("isAnimeShow", () => {
  it("counts the Anime genre and Japanese animation", () => {
    expect(isAnimeShow({ genres: ["Drama", "Anime"], type: "Scripted" })).toBe(
      true
    );
    expect(
      isAnimeShow({
        genres: ["Action"],
        type: "Animation",
        language: "Japanese",
      })
    ).toBe(true);
    expect(
      isAnimeShow({
        genres: ["Comedy"],
        type: "Animation",
        language: "English",
      })
    ).toBe(false);
  });
});

describe("toPoolShows", () => {
  it("keeps popular shows that have a poster", () => {
    const shows = toPoolShows(
      [
        {
          id: 1,
          name: "Kept",
          weight: 85,
          image: { original: "https://img.example/kept.jpg" },
          genres: ["Anime"],
          status: "Running",
          rating: { average: 9 },
        },
        {
          id: 2,
          name: "Unpopular",
          weight: 84,
          image: { original: "https://img.example/no.jpg" },
          genres: [],
          status: "Running",
        },
        {
          id: 3,
          name: "No poster",
          weight: 90,
          genres: [],
          status: "Ended",
        },
      ],
      10
    );

    expect(shows.map((show) => show.name)).toEqual(["Kept"]);
    expect(shows[0]?.isAnime).toBe(true);
    expect(shows[0]?.posterUrl).toBe("https://img.example/kept.jpg");
  });
});
