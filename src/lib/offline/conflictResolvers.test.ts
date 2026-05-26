import { describe, expect, it } from "vitest";
import { resolveChallenge, resolveVillageState } from "./conflictResolvers";

describe("resolveVillageState", () => {
  it("returns remote when local is null", () => {
    const remote = { updatedAt: 10, value: "remote" };
    expect(resolveVillageState(null, remote)).toEqual(remote);
  });

  it("returns local when remote is null", () => {
    const local = { updatedAt: 10, value: "local" };
    expect(resolveVillageState(local, null)).toEqual(local);
  });

  it("returns local when local updatedAt is higher", () => {
    const local = { updatedAt: 20, value: "local" };
    const remote = { updatedAt: 10, value: "remote" };
    expect(resolveVillageState(local, remote)).toEqual(local);
  });

  it("returns remote when remote updatedAt is higher", () => {
    const local = { updatedAt: 10, value: "local" };
    const remote = { updatedAt: 20, value: "remote" };
    expect(resolveVillageState(local, remote)).toEqual(remote);
  });

  it("returns remote when timestamps are equal", () => {
    const local = { updatedAt: 10, value: "local" };
    const remote = { updatedAt: 10, value: "remote" };
    expect(resolveVillageState(local, remote)).toEqual(remote);
  });
});

describe("resolveChallenge", () => {
  it("returns remote when local is null", () => {
    const remote = { completed: false, id: "remote" };
    expect(resolveChallenge(null, remote)).toEqual(remote);
  });

  it("returns local when remote is null", () => {
    const local = { completed: false, id: "local" };
    expect(resolveChallenge(local, null)).toEqual(local);
  });

  it("returns a completed object when local is completed", () => {
    const local = { completed: true, id: "local" };
    const remote = { completed: false, id: "remote" };
    expect(resolveChallenge(local, remote)).toEqual({
      completed: true,
      id: "local",
    });
  });

  it("returns remote when both are incomplete", () => {
    const local = { completed: false, id: "local" };
    const remote = { completed: false, id: "remote" };
    expect(resolveChallenge(local, remote)).toEqual(remote);
  });

  it("returns a completed object when both are completed", () => {
    const local = { completed: true, id: "local" };
    const remote = { completed: true, id: "remote" };
    expect(resolveChallenge(local, remote)).toEqual({
      completed: true,
      id: "local",
    });
  });
});
