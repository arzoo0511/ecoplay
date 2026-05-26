import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addPendingWrite,
  clearPendingWrites,
  getPendingWrites,
  getStaleWrites,
  incrementRetry,
  removePendingWrite,
} from "./offlineStore";

describe("offlineStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("adds a pending write with retry metadata", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("write-1");

    addPendingWrite("score", { score: 100 });

    expect(getPendingWrites()).toEqual([
      expect.objectContaining({
        id: "write-1",
        type: "score",
        payload: { score: 100 },
        retryCount: 0,
        lastAttempt: 0,
      }),
    ]);
  });

  it("removes only the targeted write", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("write-1")
      .mockReturnValueOnce("write-2");

    addPendingWrite("score", { score: 100 });
    addPendingWrite("bingo", { missionId: 1 });

    removePendingWrite("write-1");

    expect(getPendingWrites()).toEqual([
      expect.objectContaining({ id: "write-2", type: "bingo" }),
    ]);
  });

  it("increments retry count and updates lastAttempt", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("write-1");

    addPendingWrite("challenge", { id: "challenge-1" });
    incrementRetry("write-1");

    const [write] = getPendingWrites();
    expect(write.retryCount).toBe(1);
    expect(write.lastAttempt).toBeGreaterThan(0);
  });

  it("returns only stale writes at or above the retry threshold", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("write-1")
      .mockReturnValueOnce("write-2")
      .mockReturnValueOnce("write-3");

    addPendingWrite("score", { score: 10 });
    addPendingWrite("bingo", { missionId: 1 });
    addPendingWrite("challenge", { id: "challenge-1" });

    incrementRetry("write-1");
    incrementRetry("write-1");
    incrementRetry("write-1");
    incrementRetry("write-2");
    incrementRetry("write-2");

    expect(getStaleWrites(3).map((write) => write.id)).toEqual(["write-1"]);
  });

  it("clears all pending writes", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("write-1");

    addPendingWrite("score", { score: 100 });
    clearPendingWrites();

    expect(getPendingWrites()).toEqual([]);
  });

  it("returns an empty array when storage is empty", () => {
    expect(getPendingWrites()).toEqual([]);
  });
});
