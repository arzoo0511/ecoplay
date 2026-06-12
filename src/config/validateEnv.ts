export function validateEnv(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isPlaceholderValue = (value?: string) =>
    !value ||
    value.includes("your-project") ||
    value.includes("your-anon-key") ||
    value.includes("placeholder");

  if (isPlaceholderValue(url)) {
    missing.push("VITE_SUPABASE_URL");
  }

  if (isPlaceholderValue(anonKey)) {
    missing.push("VITE_SUPABASE_ANON_KEY");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}