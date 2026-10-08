import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";

import { ERROR_CODES, raise } from "./errors";

describe("raise", () => {
  it("throws a ConvexError carrying the code", () => {
    try {
      raise(ERROR_CODES.UNAUTHENTICATED);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ConvexError);
      expect((error as ConvexError<{ code: string }>).data.code).toBe(
        ERROR_CODES.UNAUTHENTICATED
      );
    }
  });
});
