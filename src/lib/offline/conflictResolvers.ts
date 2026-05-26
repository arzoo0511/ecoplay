export function resolveVillageState(local: unknown, remote: unknown): unknown {
  const localState = local as { updatedAt?: number } | null;
  const remoteState = remote as { updatedAt?: number } | null;

  if (remoteState == null) {
    return localState;
  }

  if (localState == null) {
    return remoteState;
  }

  return (localState.updatedAt ?? 0) > (remoteState.updatedAt ?? 0)
    ? localState
    : remoteState;
}

export function resolveChallenge(local: unknown, remote: unknown): unknown {
  const localChallenge = local as Record<string, unknown> | null;
  const remoteChallenge = remote as Record<string, unknown> | null;

  if (localChallenge == null) {
    return remoteChallenge;
  }

  if (remoteChallenge == null) {
    return localChallenge;
  }

  if (localChallenge.completed === true || remoteChallenge.completed === true) {
    return { ...remoteChallenge, ...localChallenge, completed: true };
  }

  return remoteChallenge;
}
