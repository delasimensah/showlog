import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createOrUpdateShowlogUser } from "./lib/singleAccount";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = params.email;
        if (typeof email !== "string" || email.length === 0) {
          throw new Error("Email is required");
        }
        const name = typeof params.name === "string" ? params.name.trim() : "";
        return {
          email: email.trim().toLowerCase(),
          ...(name.length > 0 ? { name } : {}),
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const name = args.profile.name;
      return await createOrUpdateShowlogUser(ctx as MutationCtx, {
        existingUserId: args.existingUserId as Id<"users"> | null,
        email: args.profile.email,
        name: typeof name === "string" ? name : undefined,
      });
    },
  },
});
