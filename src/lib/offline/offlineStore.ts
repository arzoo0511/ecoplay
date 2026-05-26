export type PendingWrite = {
  id: string;
  type: "bingo" | "challenge" | "score";
  payload: unknown;
  createdAt: number;
  retryCount: number;
  lastAttempt: number;
};

const PENDING_WRITES_KEY = "ecoplay.pending_writes";

export function getPendingWrites(): PendingWrite[] {
  try {
    const raw = localStorage.getItem(PENDING_WRITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addPendingWrite(
  type: PendingWrite["type"],
  payload: unknown
): void {
  try {
    const writes = getPendingWrites();
    writes.push({
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      lastAttempt: 0,
    });
    localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(writes));
  } catch {
    // ignore storage failures
  }
}

export function removePendingWrite(id: string): void {
  try {
    const writes = getPendingWrites().filter((write) => write.id !== id);
    localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(writes));
  } catch {
    // ignore storage failures
  }
}

export function clearPendingWrites(): void {
  try {
    localStorage.removeItem(PENDING_WRITES_KEY);
  } catch {
    // ignore storage failures
  }
}

export function incrementRetry(id: string): void {
  try {
    const writes = getPendingWrites().map((write) =>
      write.id === id
        ? {
            ...write,
            retryCount: write.retryCount + 1,
            lastAttempt: Date.now(),
          }
        : write
    );
    localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(writes));
  } catch {
    // ignore storage failures
  }
}

export function getStaleWrites(maxRetries: number): PendingWrite[] {
  try {
    return getPendingWrites().filter((write) => write.retryCount >= maxRetries);
  } catch {
    return [];
  }
}
