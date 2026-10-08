const WRONG_PASSWORD_MESSAGE =
  "Email or password is wrong. Check both and try again.";

const WRONG_PASSWORD_KEYS = [
  "Invalid account ID",
  "InvalidAccountId",
  "InvalidSecret",
  "Invalid login credentials",
  "Invalid credentials",
];

/**
 * Map auth failures to a message the user can act on.
 */
export const handleAuthError = (
  error: { message?: string; code?: string } | Error | unknown
): { message: string; code?: string } => {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: string }).message ?? "")
        : "";

  const errorMessages: Record<string, string> = {
    "Invalid account ID": WRONG_PASSWORD_MESSAGE,
    InvalidAccountId: WRONG_PASSWORD_MESSAGE,
    InvalidSecret: WRONG_PASSWORD_MESSAGE,
    "Invalid login credentials": WRONG_PASSWORD_MESSAGE,
    "Invalid credentials": WRONG_PASSWORD_MESSAGE,
    TooManyFailedAttempts: "Too many attempts. Please try again later.",
  };

  const looksLikeWrongPassword = WRONG_PASSWORD_KEYS.some((key) =>
    rawMessage.toLowerCase().includes(key.toLowerCase())
  );
  const customMessage = looksLikeWrongPassword
    ? WRONG_PASSWORD_MESSAGE
    : rawMessage
      ? errorMessages[rawMessage]
      : undefined;
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : undefined;

  return {
    message: customMessage || rawMessage || "An authentication error occurred",
    code: code || undefined,
  };
};
