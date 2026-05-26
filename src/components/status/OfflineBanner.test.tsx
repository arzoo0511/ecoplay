import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OfflineBanner from "./OfflineBanner";

describe("OfflineBanner", () => {
  it("renders nothing when visible is false", () => {
    const { container } = render(
      <OfflineBanner visible={false} message="Offline" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message when visible is true", () => {
    render(<OfflineBanner visible={true} message="Offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("includes pending sync text when pendingCount is greater than zero", () => {
    render(
      <OfflineBanner visible={true} message="Offline" pendingCount={3} />
    );

    expect(
      screen.getByText("Offline (3 change(s) pending sync)")
    ).toBeInTheDocument();
  });

  it("does not include pending sync text when pendingCount is zero", () => {
    render(
      <OfflineBanner visible={true} message="Offline" pendingCount={0} />
    );

    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.queryByText(/pending sync/i)).not.toBeInTheDocument();
  });
});
