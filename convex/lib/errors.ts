import { ConvexError } from "convex/values";

export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  NOT_PERMITTED: "NOT_PERMITTED",
  INVALID: "INVALID",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export function raise(code: ErrorCode, message?: string): never {
  throw new ConvexError({ code, message: message ?? code });
}
