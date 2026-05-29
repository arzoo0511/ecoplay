import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("AuthContext forgotPassword", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the setup error when Supabase is not configured", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://your-project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "your-anon-key");

    const { AuthProvider, useAuth } = await import("./AuthContext");

    const Probe = () => {
      const { forgotPassword } = useAuth();
      const [message, setMessage] = useState("");

      return (
        <>
          <button
            type="button"
            onClick={async () => {
              const result = await forgotPassword("user@example.com");
              setMessage(result.error || "");
            }}
          >
            Reset password
          </button>
          <p>{message}</p>
        </>
      );
    };

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(
      await screen.findByText(
        "Missing VITE_SUPABASE_URL. Add your Supabase project URL to .env."
      )
    ).toBeInTheDocument();
  });
});
