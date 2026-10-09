import { v } from "convex/values";

import { authedQuery } from "./lib/functions";

export const account = authedQuery({
  args: {},
  returns: v.object({
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const user = await ctx.db.get(ctx.userId);
    return {
      name: user?.name ?? null,
      email: user?.email ?? null,
    };
  },
});
