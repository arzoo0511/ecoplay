import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConfigErrorScreen from "./ConfigErrorScreen";

describe("ConfigErrorScreen", () => {
  it("renders the configuration heading", () => {
    render(<ConfigErrorScreen missing={["VITE_SUPABASE_URL"]} />);
    expect(screen.getByText("Configuration Error")).toBeInTheDocument();
  });

  it("renders each missing variable name", () => {
    render(
      <ConfigErrorScreen
        missing={["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]}
      />
    );

    expect(screen.getByText("VITE_SUPABASE_URL")).toBeInTheDocument();
    expect(screen.getByText("VITE_SUPABASE_ANON_KEY")).toBeInTheDocument();
  });

  it("renders the env instruction text", () => {
    render(<ConfigErrorScreen missing={["VITE_SUPABASE_URL"]} />);

    expect(
      screen.getByText(
        "Copy .env.example to .env and fill in your Supabase credentials, then restart the app."
      )
    ).toBeInTheDocument();
  });

  it("renders no variable list items when missing is empty", () => {
    render(<ConfigErrorScreen missing={[]} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
