export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === "https://your-project.supabase.co"
  ) {
    missing.push("VITE_SUPABASE_URL");
  }

  if (
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY === "your-anon-key"
  ) {
    missing.push("VITE_SUPABASE_ANON_KEY");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
