import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./authErrors";

describe("getAuthErrorMessage", () => {
  it("maps network failures to a helpful auth server message", () => {
    expect(getAuthErrorMessage(new Error("Failed to fetch"), "Fallback")).toBe(
      "Unable to reach the authentication server. Check your internet connection and Supabase project URL."
    );
  });

  it("maps invalid credentials to a friendly login error", () => {
    expect(
      getAuthErrorMessage(new Error("Invalid login credentials"), "Fallback")
    ).toBe("Incorrect email or password.");
  });

  it("returns the original error message when no mapping applies", () => {
    expect(getAuthErrorMessage(new Error("Email rate limit exceeded"), "Fallback")).toBe(
      "Email rate limit exceeded"
    );
  });

  it("uses the fallback when the error has no readable message", () => {
    expect(getAuthErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
