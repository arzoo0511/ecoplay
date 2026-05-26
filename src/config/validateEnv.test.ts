import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEnv } from "./validateEnv";

describe("validateEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns valid when both vars are real values", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "real-anon-key");

    expect(validateEnv()).toEqual({ valid: true, missing: [] });
  });

  it("returns missing URL when URL is the placeholder", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://your-project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "real-anon-key");

    expect(validateEnv()).toEqual({
      valid: false,
      missing: ["VITE_SUPABASE_URL"],
    });
  });

  it("returns missing key when key is the placeholder", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "your-anon-key");

    expect(validateEnv()).toEqual({
      valid: false,
      missing: ["VITE_SUPABASE_ANON_KEY"],
    });
  });

  it("returns both missing values when both are placeholders", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://your-project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "your-anon-key");

    expect(validateEnv()).toEqual({
      valid: false,
      missing: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
    });
  });

  it("returns both missing values when both are empty", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv(
      "VITE_SUPABASE_ANON_KEY",
      undefined as unknown as string
    );

    const result = validateEnv();

    expect(result.valid).toBe(false);
    expect(result.missing).toEqual([
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_ANON_KEY",
    ]);
  });
});
