/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";

import { chunkEpisodes } from "../showModel";

describe("chunkEpisodes", () => {
  it("splits a long show into batches of 500", () => {
    const batches = chunkEpisodes(
      Array.from({ length: 1101 }, (_, index) => index)
    );
    expect(batches.map((batch) => batch.length)).toEqual([500, 500, 101]);
  });
});
