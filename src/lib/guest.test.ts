import { beforeEach, describe, expect, it } from "vitest";
import {
  clearGuestState,
  enterGuestMode,
  exitGuestMode,
  hasGuestState,
  isGuestMode,
} from "./guest";

describe("guest helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("enters guest mode", () => {
    enterGuestMode();
    expect(isGuestMode()).toBe(true);
  });

  it("exits guest mode", () => {
    enterGuestMode();
    exitGuestMode();
    expect(isGuestMode()).toBe(false);
  });

  it("returns false for guest state when none exists", () => {
    expect(hasGuestState()).toBe(false);
  });

  it("returns true when guest state exists", () => {
    localStorage.setItem("ecoplay.state.guest", JSON.stringify({ points: 10 }));
    expect(hasGuestState()).toBe(true);
  });

  it("clears guest mode and guest state", () => {
    enterGuestMode();
    localStorage.setItem("ecoplay.state.guest", JSON.stringify({ points: 10 }));

    clearGuestState();

    expect(localStorage.getItem("ecoplay.state.guest")).toBeNull();
    expect(localStorage.getItem("ecoplay.guest_mode")).toBeNull();
  });
});
