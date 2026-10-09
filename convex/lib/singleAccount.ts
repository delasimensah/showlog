import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export const ACCOUNT_TAKEN_MESSAGE = "This app already has an account.";

/**
 * Creates the one Showlog user, or returns the user who is already signing in.
 * A second new account is refused, including a direct call to sign-up.
 */
export async function createOrUpdateShowlogUser(
  ctx: MutationCtx,
  args: {
    existingUserId: Id<"users"> | null;
    email: string | undefined;
    name: string | undefined;
  }
): Promise<Id<"users">> {
  if (args.existingUserId !== null) {
    return args.existingUserId;
  }

  const existingUser = await ctx.db.query("users").first();
  if (existingUser !== null) {
    throw new Error(ACCOUNT_TAKEN_MESSAGE);
  }

  const email = args.email?.trim().toLowerCase();
  if (email === undefined || email.length === 0) {
    throw new Error("Email is required");
  }

  const name = args.name?.trim();
  if (name === undefined || name.length === 0) {
    throw new Error("Name is required");
  }

  return await ctx.db.insert("users", { email, name });
}
