export interface PersistPayload {
  userId: string;
  state: any;
}

const keyFor = (userId: string) => `ecoplay.state.${userId}`;

export function loadState(userId: string) {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState({ userId, state }: PersistPayload) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(state));
  } catch {
    // storage full or blocked
  }
}