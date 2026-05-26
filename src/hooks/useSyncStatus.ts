import { useEffect, useState } from "react";
import { getPendingWrites } from "../lib/offline/offlineStore";
import { runSync } from "../lib/offline/syncQueue";
import { supabase } from "../lib/supabase";

export default function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(() => getPendingWrites().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const syncIfNeeded = async () => {
      const currentPending = getPendingWrites().length;
      if (active) {
        setPendingCount(currentPending);
      }

      if (currentPending === 0) {
        return;
      }

      if (active) {
        setIsSyncing(true);
      }

      await runSync(supabase);

      if (active) {
        setPendingCount(getPendingWrites().length);
        setIsSyncing(false);
        setLastSyncAt(Date.now());
      }
    };

    void syncIfNeeded();

    const interval = setInterval(() => {
      void syncIfNeeded();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return {
    pendingCount,
    isSyncing,
    lastSyncAt,
  };
}
