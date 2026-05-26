export interface PersistPayload {
  userId: string;
  state: any;
}

export const keyFor = (
  userId: string
) => `ecoplay.state.${userId}`;

/**
 * Clears saved user state safely.
 */
export function clearState(
  userId: string
) {

  try {

    localStorage.removeItem(
      keyFor(userId)
    );

  } catch (error) {

    console.error(
      '[Persistence] Failed to clear state:',
      error
    );
  }
}

/**
 * Loads persisted state safely.
 * Prevents crashes from corrupted JSON.
 */
export function loadState(
  userId: string
) {

  try {

    const raw = localStorage.getItem(
      keyFor(userId)
    );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    // Basic validation
    if (
      typeof parsed !== 'object' ||
      parsed === null
    ) {

      console.warn(
        '[Persistence] Invalid saved state format'
      );

      return null;
    }

    return parsed;

  } catch (error) {

    console.error(
      '[Persistence] Failed to load saved state:',
      error
    );

    // Prevent corrupted storage crashes
    return null;
  }
}

/**
 * Saves game state safely.
 */
export function saveState({
  userId,
  state
}: PersistPayload) {

  try {

    // Prevent undefined saves
    if (!state) {

      console.warn(
        '[Persistence] Attempted to save empty state'
      );

      return;
    }

    const serialized =
      JSON.stringify(state);

    localStorage.setItem(
      keyFor(userId),
      serialized
    );

  } catch (error) {

    console.error(
      '[Persistence] Failed to save state:',
      error
    );

    // localStorage may be full/blocked
  }
}