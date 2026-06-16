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

  const localProgress = typeof localChallenge.progress === 'number' ? localChallenge.progress : 0;
  const remoteProgress = typeof remoteChallenge.progress === 'number' ? remoteChallenge.progress : 0;

  if (localProgress !== remoteProgress) {
    const winner = localProgress > remoteProgress ? localChallenge : remoteChallenge;
    return { ...remoteChallenge, ...winner, progress: Math.max(localProgress, remoteProgress) };
  }

  const localTime = typeof localChallenge.updatedAt === 'number' ? localChallenge.updatedAt : 0;
  const remoteTime = typeof remoteChallenge.updatedAt === 'number' ? remoteChallenge.updatedAt : 0;
  return localTime > remoteTime
    ? { ...remoteChallenge, ...localChallenge }
    : { ...localChallenge, ...remoteChallenge };
}
