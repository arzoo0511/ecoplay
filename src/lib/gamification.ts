/**
 * EcoPlay Gamification Engine
 * Issue #4 – XP calculation, streak management, badge logic
 *
 * Formula: Final XP = ROUND(base_xp × difficulty_weight × streak_multiplier)
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
// Mirrors the GENERATED ALWAYS AS expression in SQL exactly.
// Used client-side for optimistic UI updates.

export function computeStreakMultiplier(currentStreak: number): number {
  if (currentStreak >= 30) return 3;
  if (currentStreak >= 14) return 2.5;
  if (currentStreak >= 7)  return 2;
  if (currentStreak >= 3)  return 1.5;
  return 1;
}

// ─── XP Award ────────────────────────────────────────────────

/**
 * Awards XP for a completed activity.
 * Reads base_xp + difficulty_weight from xp_config,
 * reads streak_multiplier from user_streaks,
 * inserts into xp_ledger (triggers handle user_stats + streak update).
 */
export async function awardXP(
  userId: string,
  activityType: ActivityType,
  metadata?: Record<string, unknown>
): Promise<XPAwardResult> {



  // 4. Fetch current level BEFORE insert for level-up detection
  const { data: statsBefore } = await supabase
    .from('user_stats')
    .select('current_level')
    .eq('user_id', userId)
    .single();

  const levelBefore = statsBefore?.current_level ?? 1;

  // Call the secure RPC to compute and award XP on the backend
  const { data, error } = await supabase.rpc('award_xp_secure', {
    p_activity_type: activityType,
    p_metadata: metadata ?? null
  });

  if (error) {
    console.error('[EcoPlay] Secure XP award failed:', error);
    throw error;
  }

  interface AwardXPSecureResult {
    final_xp: number;
    base_xp: number;
    difficulty_weight: number;
    streak_multiplier: number;
    new_total_xp: number;
    new_level: number;
    current_streak: number;
  }
  const result = data as AwardXPSecureResult;

  // Check for newly earned badges
  const newBadges = await checkAndAwardBadges(userId, activityType, result.current_streak ?? 0);

  return {
    finalXP: result.final_xp,
    baseXP: result.base_xp,
    difficultyWeight: result.difficulty_weight,
    streakMultiplier: result.streak_multiplier,
    newTotalXP: result.new_total_xp,
    newLevel: result.new_level,
    leveledUp: result.new_level > levelBefore,
    newBadges,
  };
}

// ─── Badge Engine ─────────────────────────────────────────────

/**
 * Evaluates badge unlock conditions after an activity.
 * Returns keys of newly awarded badges.
 */
async function checkAndAwardBadges(
  userId: string,
  _activityType: ActivityType,
  currentStreak: number
): Promise<string[]> {
  // Fetch all badges the user already holds
  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', userId);

  const alreadyEarned = new Set((existing ?? []).map((r: { badge_key: string }) => r.badge_key));

  // Fetch activity counts needed for badge evaluation
  const { data: counts } = await supabase
    .from('xp_ledger')
    .select('activity_type')
    .eq('user_id', userId);

  const activityCounts = (counts ?? []).reduce<Record<string, number>>((acc, row: { activity_type: string }) => {
    acc[row.activity_type] = (acc[row.activity_type] ?? 0) + 1;
    return acc;
  }, {});

  const { data: stats } = await supabase
    .from('user_stats')
    .select('current_level')
    .eq('user_id', userId)
    .single();

  const currentLevel = stats?.current_level ?? 1;

  // Evaluate conditions
  const candidates: string[] = [];

  const conditions = [
    { key: 'first_cleanup',    met: (activityCounts['ocean_cleanup_basic'] ?? 0) >= 1 },
    { key: 'streak_3',         met: currentStreak >= 3 },
    { key: 'streak_7',         met: currentStreak >= 7 },
    { key: 'streak_30',        met: currentStreak >= 30 },
    { key: 'level_5',          met: currentLevel >= 5 },
    { key: 'level_10',         met: currentLevel >= 10 },
    { key: 'community_voice',  met: (activityCounts['community_post'] ?? 0) >= 10 },
    { key: 'eco_builder',      met: (activityCounts['eco_village_upgrade'] ?? 0) >= 5 },
    { key: 'knowledge_seeker', met: (activityCounts['learn_video'] ?? 0) >= 10 }
  ];

  for (const { key, met } of conditions) {
    if (!alreadyEarned.has(key) && met) {
      candidates.push(key);
    }
  }

if (candidates.length === 0) return [];

try {
  const { error } = await supabase.rpc('award_badges_secure', {
    p_badge_keys: candidates
  });

  if (error) {
    console.error('[EcoPlay] Badge insert error:', error);
    return [];
  }

  return candidates;
} catch (error) {
  console.error('[EcoPlay] checkAndAwardBadges crashed:', error);
  return [];
}

// --- Stats Fetchers ---
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('user_id, total_xp, current_level, xp_to_next_level, activities_count')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    totalXP: data.total_xp,
    currentLevel: data.current_level,
    xpToNextLevel: data.xp_to_next_level,
    activitiesCount: data.activities_count,
  };
}

export async function getUserStreak(userId: string): Promise<UserStreak> {
  const { data } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, last_activity_date, streak_multiplier')
    .eq('user_id', userId)
    .single();

  return {
    currentStreak: data?.current_streak ?? 0,
    longestStreak: data?.longest_streak ?? 0,
    lastActivityDate: data?.last_activity_date ?? null,
    streakMultiplier: data?.streak_multiplier ?? 1,
  };
}

  return [];
}
}

export async function getUserBadges(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_key, earned_at, badges(name, description, icon)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('[EcoPlay] getUserBadges failed:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('[EcoPlay] getUserBadges crashed:', error);
    return [];
  }
}