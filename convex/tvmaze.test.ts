import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchJson,
  stripHtml,
  toEpisodeCopies,
  toShowCopy,
  countNumberedSeasons,
} from "./tvmaze";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("stripHtml", () => {
  it("removes tags and decodes the usual characters", () => {
    expect(stripHtml("<p>Monkey D. Luffy &amp; his crew.</p>")).toBe(
      "Monkey D. Luffy & his crew."
    );
  });
});

describe("countNumberedSeasons", () => {
  it("counts numbered seasons and drops specials", () => {
    expect(
      countNumberedSeasons([
        { number: 1 },
        { number: 1999 },
        { number: null },
        { number: 0 },
      ])
    ).toBe(2);
  });
});

describe("toEpisodeCopies", () => {
  it("drops specials and episodes with no number", () => {
    const copies = toEpisodeCopies([
      {
        id: 1,
        name: "Pilot",
        season: 0,
        number: 1,
        type: "significant_special",
      },
      { id: 2, name: "Untitled", season: 1, number: null, type: "regular" },
      {
        id: 3,
        name: "I'm Luffy!",
        season: 1,
        number: 1,
        type: "regular",
      },
    ]);

    expect(copies).toHaveLength(1);
    expect(copies[0]?.name).toBe("I'm Luffy!");
    expect(copies[0]?.order).toBe(1);
  });

  it("stores a date with no time as midnight UTC", () => {
    const copies = toEpisodeCopies([
      {
        id: 9,
        name: "Romance Dawn",
        season: 1,
        number: 1,
        type: "regular",
        airdate: "1999-10-20",
        airstamp: null,
        airtime: "",
      },
    ]);

    expect(copies[0]?.airTimeKnown).toBe(false);
    expect(copies[0]?.airsAt).toBe(Date.parse("1999-10-20T00:00:00.000Z"));
  });
});

describe("toShowCopy", () => {
  const episodes = toEpisodeCopies([
    { id: 1, name: "Start", season: 1999, number: 1, type: "regular" },
    { id: 2, name: "Next", season: 1999, number: 2, type: "regular" },
    { id: 3, name: "Later", season: 2026, number: 1, type: "regular" },
  ]);

  it("uses a background picture when none is marked as the main one", () => {
    const show = toShowCopy(
      {
        id: 1505,
        name: "One Piece",
        status: "Running",
        updated: 1_700_000_000,
        image: {
          original: "https://img.example/poster.jpg",
          medium: "https://img.example/poster-m.jpg",
        },
        _embedded: {
          images: [
            {
              type: "background",
              main: false,
              resolutions: {
                original: { url: "https://img.example/bg.jpg" },
              },
            },
          ],
        },
      },
      episodes
    );

    expect(show.headerUrl).toBe("https://img.example/bg.jpg");
    expect(show.posterUrl).toBe("https://img.example/poster.jpg");
  });

  it("uses the poster when there is no background", () => {
    const show = toShowCopy(
      {
        id: 1505,
        name: "One Piece",
        status: "Running",
        updated: 1_700_000_000,
        image: { original: "https://img.example/poster.jpg" },
        _embedded: { images: [] },
      },
      []
    );

    expect(show.headerUrl).toBe("https://img.example/poster.jpg");
  });

  it("treats seasons numbered 1900 or higher as years", () => {
    const show = toShowCopy(
      {
        id: 1505,
        name: "One Piece",
        status: "Running",
        updated: 1_700_000_000,
      },
      episodes
    );

    expect(show.yearSeasons).toBe(true);
    expect(show.seasons).toEqual([
      { number: 1999, episodeCount: 2, firstOrder: 1 },
      { number: 2026, episodeCount: 1, firstOrder: 3 },
    ]);
  });
});

describe("fetchJson", () => {
  it("retries after a 429 and sends the Showlog user agent", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 429,
          headers: { "Retry-After": "1" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const pending = fetchJson("/shows/1");
    await vi.advanceTimersByTimeAsync(1000);

    await expect(pending).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      "User-Agent":
        "Showlog/1.0 (personal app; github.com/delasimensah/showlog)",
    });
  });
});
