import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    isGuest: false,
    supabaseError: null,
  }),
}));

vi.mock("./context/GameContext", () => ({
  GameProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("./hooks/useSyncStatus", () => ({
  default: () => ({
    pendingCount: 0,
    isSyncing: false,
    lastSyncAt: null,
  }),
}));

vi.mock("./pages/LandingPage", () => ({
  default: () => <div>Landing Page</div>,
}));

vi.mock("./pages/Login", () => ({
  default: () => <div>Login Page</div>,
}));

describe("App blank screen regression", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the configuration screen when Supabase env vars are placeholders", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://your-project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "your-anon-key");

    render(<App />);

    expect(screen.getByText("Configuration Error")).toBeInTheDocument();
    expect(screen.queryByText("Landing Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Auth Page")).not.toBeInTheDocument();
  });
});
