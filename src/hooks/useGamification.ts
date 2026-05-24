/**
 * useGamification – React hook for the EcoPlay gamification system.
 * Wraps gamification.ts + leaderboard.ts with loading/error state
 * and optimistic XP updates for instant UI feedback.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from '../lib/ui';
import {
  awardXP,
  getUserStats,
  getUserStreak,
  getUserBadges,
  computeStreakMultiplier,
  type ActivityType,
  type UserStats,
  type UserStreak,
  type XPAwardResult,
} from '../lib/gamification';
import { getLeaderboard, getUserRank, type LeaderboardPage } from '../lib/leaderboard';

// ─── State shape ──────────────────────────────────────────────

interface GamificationState {
  stats:        UserStats | null;
  streak:       UserStreak | null;
  badges:       any[];
  leaderboard:  LeaderboardPage | null;
  userRank:     number | null;
  loading:      boolean;
  error:        string | null;
}

// ─── Hook ─────────────────────────────────────────────────────

export function useGamification(userId: string | null) {
  const [state, setState] = useState<GamificationState>({
    stats:       null,
    streak:      null,
    badges:      [],
    leaderboard: null,
    userRank:    null,
    loading:     false,
    error:       null,
  });

  // ── Load all data for the current user ──
  const loadAll = useCallback(async () => {
    if (!userId) return;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const [stats, streak, badges, leaderboard, userRank] = await Promise.all([
        getUserStats(userId),
        getUserStreak(userId),
        getUserBadges(userId),
        getLeaderboard(1, 20),
        getUserRank(userId),
      ]);

      setState({
        stats,
        streak,
        badges,
        leaderboard,
        userRank,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Award XP with optimistic update ──
  const earnXP = useCallback(
    async (
      activityType: ActivityType,
      metadata?: Record<string, unknown>
    ): Promise<XPAwardResult | null> => {
      if (!userId) return null;

      // Optimistic update: increment XP locally before server responds
      const currentStreak = state.streak?.currentStreak ?? 0;
      const streakMult    = computeStreakMultiplier(currentStreak);

      setState((s) => ({
        ...s,
        stats: s.stats
          ? { ...s.stats, totalXP: s.stats.totalXP + Math.round(10 * streakMult) }
          : s.stats,
      }));

      // THIS IS THE EXISTING TRY/CATCH BLOCK:
      try {
        const result = await awardXP(userId, activityType, metadata);

        // Refresh all data to sync with server truth
        await loadAll();

        return result;
      } catch (err: any) {
        // Rollback optimistic update on failure
        await loadAll();
        setState((s) => ({ ...s, error: err.message }));
        
        // 👉 ADD THIS LINE RIGHT HERE:
        toast.error("Network error: Failed to award XP. Your progress has been reverted.");
        
        return null;
      }
    },
    [userId, state.streak, loadAll]
  );
  // ── Load a specific leaderboard page ──
  const loadLeaderboardPage = useCallback(async (page: number, perPage = 20) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const leaderboard = await getLeaderboard(page, perPage);
      setState((s) => ({ ...s, leaderboard, loading: false }));
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, []);

  return {
    ...state,
    earnXP,
    loadLeaderboardPage,
    refresh: loadAll,
  };
}
