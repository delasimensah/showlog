import { handleAuthError } from "../authErrors";

describe("handleAuthError", () => {
  it("should return a user-friendly message for known errors", () => {
    const result = handleAuthError({ message: "Invalid login credentials" });

    expect(result.message).toBe(
      "Email or password is wrong. Check both and try again."
    );
  });

  it("should map Convex Auth invalid credentials", () => {
    const result = handleAuthError(new Error("Invalid credentials"));

    expect(result.message).toBe(
      "Email or password is wrong. Check both and try again."
    );
  });

  it("should return original message for unknown errors", () => {
    const result = handleAuthError({ message: "Unknown error occurred" });

    expect(result.message).toBe("Unknown error occurred");
  });

  it("should handle errors without message", () => {
    const result = handleAuthError({});

    expect(result.message).toBe("An authentication error occurred");
  });

  it("should include error code when available", () => {
    const result = handleAuthError({
      message: "Invalid login credentials",
      code: "400",
    });

    expect(result.message).toBe(
      "Email or password is wrong. Check both and try again."
    );
    expect(result.code).toBe("400");
  });
});
