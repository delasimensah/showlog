import { createAccountSchema } from "../createAccountSchema";

describe("createAccountSchema", () => {
  it("accepts a name, an email, and a password of 8 characters", () => {
    const parsed = createAccountSchema.safeParse({
      name: "Ada",
      email: "me@example.com",
      password: "long-enough",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects a short password", () => {
    const parsed = createAccountSchema.safeParse({
      name: "Ada",
      email: "me@example.com",
      password: "short",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects a blank name", () => {
    const parsed = createAccountSchema.safeParse({
      name: "   ",
      email: "me@example.com",
      password: "long-enough",
    });

    expect(parsed.success).toBe(false);
  });
});
