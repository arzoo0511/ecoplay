/**
 * EcoPlay Gamification Engine
 * Improved error handling + consistency protection
 */

import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────

export type ActivityType =
  | 'ocean_cleanup_basic'
  | 'ocean_cleanup_combo'
  | 'ocean_cleanup_perfect'
  | 'daily_challenge'
  | 'eco_village_upgrade'
  | 'community_post'
  | 'community_solution'
  | 'learn_video'
  | 'event_participation'
  | 'login_bonus';

export interface XPAwardResult {
  finalXP: number;
  baseXP: number;
  difficultyWeight: number;
  streakMultiplier: number;
  newTotalXP: number;
  newLevel: number;
  leveledUp: boolean;
  newBadges: string[];
}

export interface UserStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  activitiesCount: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakMultiplier: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
}

// ─── Streak Multiplier ────────────────────────────────────────

export function computeStreakMultiplier(
  currentStreak: number
): number {

  if (currentStreak >= 30) return 3.0;
  if (currentStreak >= 14) return 2.5;
  if (currentStreak >= 7) return 2.0;
  if (currentStreak >= 3) return 1.5;

  return 1.0;
}

// ─── XP Award ────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  activityType: ActivityType,
  metadata?: Record<string, unknown>
): Promise<XPAwardResult> {

  try {

    // 1. Fetch XP config
    const {
      data: config,
      error: cfgErr
    } = await supabase
      .from('xp_config')
      .select('base_xp, difficulty_weight')
      .eq('activity_type', activityType)
      .single();

    if (cfgErr || !config) {

      console.error(
        '[EcoPlay] XP config fetch failed:',
        cfgErr
      );

      throw new Error(
        `Unknown activity type: ${activityType}`
      );
    }

    // 2. Fetch current streak
    const {
      data: streakRow,
      error: streakErr
    } = await supabase
      .from('user_streaks')
      .select(
        'streak_multiplier, current_streak'
      )
      .eq('user_id', userId)
      .single();

    if (streakErr) {

      console.warn(
        '[EcoPlay] Failed to fetch streak data:',
        streakErr
      );
    }

    const streakMultiplier: number =
      streakRow?.streak_multiplier ?? 1.0;

    // 3. Calculate XP
    const finalXP = Math.round(
      config.base_xp *
      config.difficulty_weight *
      streakMultiplier
    );

    // 4. Fetch previous stats
    const {
      data: statsBefore,
      error: statsBeforeErr
    } = await supabase
      .from('user_stats')
      .select(
        'current_level, total_xp'
      )
      .eq('user_id', userId)
      .single();

    if (statsBeforeErr) {

      console.warn(
        '[EcoPlay] Failed to fetch previous stats:',
        statsBeforeErr
      );
    }

    const levelBefore =
      statsBefore?.current_level ?? 1;

    // 5. Insert XP ledger
    const {
      error: ledgerErr
    } = await supabase
      .from('xp_ledger')
      .insert({
        user_id: userId,
        activity_type: activityType,
        base_xp: config.base_xp,
        difficulty_weight:
          config.difficulty_weight,
        streak_multiplier:
          streakMultiplier,
        final_xp: finalXP,
        metadata: metadata ?? null,
      });

    if (ledgerErr) {

      console.error(
        '[EcoPlay] XP ledger insert failed:',
        ledgerErr
      );

      throw ledgerErr;
    }

    // 6. Fetch updated stats
    const {
      data: statsAfter,
      error: statsErr
    } = await supabase
      .from('user_stats')
      .select(
        'total_xp, current_level, xp_to_next_level'
      )
      .eq('user_id', userId)
      .single();

    if (statsErr || !statsAfter) {

      console.error(
        '[EcoPlay] Failed to fetch updated stats:',
        statsErr
      );

      throw new Error(
        'Failed to fetch updated user stats.'
      );
    }

    // 7. Badge checks
    const newBadges =
      await checkAndAwardBadges(
        userId,
        activityType,
        streakRow?.current_streak ?? 0
      );

    return {
      finalXP,
      baseXP: config.base_xp,
      difficultyWeight:
        config.difficulty_weight,
      streakMultiplier,
      newTotalXP:
        statsAfter.total_xp,
      newLevel:
        statsAfter.current_level,
      leveledUp:
        statsAfter.current_level >
        levelBefore,
      newBadges,
    };

  } catch (error) {

    console.error(
      '[EcoPlay] awardXP failed:',
      error
    );

    throw error;
  }
}

// ─── Badge Engine ─────────────────────────────────────────────

async function checkAndAwardBadges(
  userId: string,
  _activityType: ActivityType,
  currentStreak: number
): Promise<string[]> {

  try {

    // Existing badges
    const {
      data: existing,
      error: existingErr
    } = await supabase
      .from('user_badges')
      .select('badge_key')
      .eq('user_id', userId);

    if (existingErr) {

      console.error(
        '[EcoPlay] Failed to fetch existing badges:',
        existingErr
      );

      return [];
    }

    const alreadyEarned = new Set(
      (existing ?? []).map(
        (r) => r.badge_key
      )
    );

    // Activity counts
    const {
      data: counts,
      error: countsErr
    } = await supabase
      .from('xp_ledger')
      .select('activity_type')
      .eq('user_id', userId);

    if (countsErr) {

      console.error(
        '[EcoPlay] Failed to fetch activity counts:',
        countsErr
      );

      return [];
    }

    const activityCounts =
      (counts ?? []).reduce<
        Record<string, number>
      >((acc, row) => {

        acc[row.activity_type] =
          (acc[row.activity_type] ?? 0) + 1;

        return acc;

      }, {});

    // Current level
    const {
      data: stats,
      error: statsErr
    } = await supabase
      .from('user_stats')
      .select('current_level')
      .eq('user_id', userId)
      .single();

    if (statsErr) {

      console.error(
        '[EcoPlay] Failed to fetch user stats:',
        statsErr
      );

      return [];
    }

    const currentLevel =
      stats?.current_level ?? 1;

    const candidates: string[] = [];

    // Badge conditions
    if (
      !alreadyEarned.has(
        'first_cleanup'
      ) &&
      (activityCounts[
        'ocean_cleanup_basic'
      ] ?? 0) >= 1
    ) {
      candidates.push(
        'first_cleanup'
      );
    }

    if (
      !alreadyEarned.has('streak_3') &&
      currentStreak >= 3
    ) {
      candidates.push('streak_3');
    }

    if (
      !alreadyEarned.has('streak_7') &&
      currentStreak >= 7
    ) {
      candidates.push('streak_7');
    }

    if (
      !alreadyEarned.has('streak_30') &&
      currentStreak >= 30
    ) {
      candidates.push('streak_30');
    }

    if (
      !alreadyEarned.has('level_5') &&
      currentLevel >= 5
    ) {
      candidates.push('level_5');
    }

    if (
      !alreadyEarned.has('level_10') &&
      currentLevel >= 10
    ) {
      candidates.push('level_10');
    }

    if (
      !alreadyEarned.has(
        'community_voice'
      ) &&
      (activityCounts[
        'community_post'
      ] ?? 0) >= 10
    ) {
      candidates.push(
        'community_voice'
      );
    }

    if (
      !alreadyEarned.has(
        'eco_builder'
      ) &&
      (activityCounts[
        'eco_village_upgrade'
      ] ?? 0) >= 5
    ) {
      candidates.push(
        'eco_builder'
      );
    }

    if (
      !alreadyEarned.has(
        'knowledge_seeker'
      ) &&
      (activityCounts[
        'learn_video'
      ] ?? 0) >= 10
    ) {
      candidates.push(
        'knowledge_seeker'
      );
    }

    if (candidates.length === 0) {
      return [];
    }

    // Insert badges safely
    const {
      error: badgeInsertError
    } = await supabase
      .from('user_badges')
      .insert(
        candidates.map((key) => ({
          user_id: userId,
          badge_key: key,
        }))
      );

    if (badgeInsertError) {

      console.error(
        '[EcoPlay] Badge insert failed:',
        badgeInsertError
      );

      // Prevent false unlock state
      return [];
    }

    return candidates;

  } catch (error) {

    console.error(
      '[EcoPlay] Badge engine failed:',
      error
    );

    return [];
  }
}

// ─── Stats Fetchers ───────────────────────────────────────────

export async function getUserStats(
  userId: string
): Promise<UserStats | null> {

  try {

    const {
      data,
      error
    } = await supabase
      .from('user_stats')
      .select(
        'user_id, total_xp, current_level, xp_to_next_level, activities_count'
      )
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      totalXP: data.total_xp,
      currentLevel:
        data.current_level,
      xpToNextLevel:
        data.xp_to_next_level,
      activitiesCount:
        data.activities_count,
    };

  } catch (error) {

    console.error(
      '[EcoPlay] getUserStats failed:',
      error
    );

    return null;
  }
}

export async function getUserStreak(
  userId: string
): Promise<UserStreak> {

  try {

    const {
      data,
      error
    } = await supabase
      .from('user_streaks')
      .select(
        'current_streak, longest_streak, last_activity_date, streak_multiplier'
      )
      .eq('user_id', userId)
      .single();

    if (error) {

      console.error(
        '[EcoPlay] getUserStreak failed:',
        error
      );

      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakMultiplier: 1.0,
      };
    }

    return {
      currentStreak:
        data?.current_streak ?? 0,
      longestStreak:
        data?.longest_streak ?? 0,
      lastActivityDate:
        data?.last_activity_date ?? null,
      streakMultiplier:
        data?.streak_multiplier ?? 1.0,
    };

  } catch (error) {

    console.error(
      '[EcoPlay] getUserStreak crashed:',
      error
    );

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakMultiplier: 1.0,
    };
  }
}

export async function getUserBadges(
  userId: string
) {

  try {

    const {
      data,
      error
    } = await supabase
      .from('user_badges')
      .select(
        'badge_key, earned_at, badges(name, description, icon)'
      )
      .eq('user_id', userId)
      .order('earned_at', {
        ascending: false
      });

    if (error) {

      console.error(
        '[EcoPlay] getUserBadges failed:',
        error
      );

      return [];
    }

    return data ?? [];

  } catch (error) {

    console.error(
      '[EcoPlay] getUserBadges crashed:',
      error
    );

    return [];
  }
}