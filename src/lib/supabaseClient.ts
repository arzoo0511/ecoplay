type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type SafeSupabaseResult<T> = {
  data: T | null;
  offline: boolean;
  error: string | null;
};

export async function safeSupabase<T>(
  fn: () => Promise<SupabaseResult<T>>
): Promise<SafeSupabaseResult<T>> {
  try {
    const { data, error } = await fn();

    if (error != null) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Unknown error";

      return { data: null, offline: false, error: message };
    }

    return { data, offline: false, error: null };
  } catch {
    return { data: null, offline: true, error: "Network error" };
  }
}
