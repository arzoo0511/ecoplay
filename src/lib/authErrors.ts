export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message)
      : "";

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("networkerror") ||
    normalizedMessage.includes("load failed")
  ) {
    return "Unable to reach the authentication server. Check your internet connection and Supabase project URL.";
  }

  if (normalizedMessage.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  return message || fallback;
}
