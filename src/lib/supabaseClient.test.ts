import { describe, expect, it } from "vitest";
import { safeSupabase } from "./supabaseClient";

describe("safeSupabase", () => {
  it("returns successful data when fn resolves without error", async () => {
    const result = await safeSupabase(async () => ({
      data: { id: 1 },
      error: null,
    }));

    expect(result).toEqual({
      data: { id: 1 },
      offline: false,
      error: null,
    });
  });

  it("returns a Supabase error message when fn resolves with an error", async () => {
    const result = await safeSupabase(async () => ({
      data: null,
      error: { message: "DB error" },
    }));

    expect(result).toEqual({
      data: null,
      offline: false,
      error: "DB error",
    });
  });

  it("returns offline when fn throws a network TypeError", async () => {
    const result = await safeSupabase(async () => {
      throw new TypeError("Failed to fetch");
    });

    expect(result).toEqual({
      data: null,
      offline: true,
      error: "Network error",
    });
  });

  it("returns offline when fn throws without a message", async () => {
    const result = await safeSupabase(async () => {
      throw Object.create(null);
    });

    expect(result).toEqual({
      data: null,
      offline: true,
      error: "Network error",
    });
  });
});
