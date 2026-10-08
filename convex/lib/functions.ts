import { getAuthUserId } from "@convex-dev/auth/server";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";

import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { ERROR_CODES, raise } from "./errors";

export const authedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      raise(ERROR_CODES.UNAUTHENTICATED);
    }
    return { userId: userId as Id<"users"> };
  })
);

export const authedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      raise(ERROR_CODES.UNAUTHENTICATED);
    }
    return { userId: userId as Id<"users"> };
  })
);
