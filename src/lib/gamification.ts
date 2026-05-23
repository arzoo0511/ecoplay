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
  if (currentStreak >= 30) return 3.0;
  if (currentStreak >= 14) return 2.5;
  if (currentStreak >= 7)  return 2.0;
  if (currentStreak >= 3)  return 1.5;
  return 1.0;
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
  // 1. Fetch config for this activity
  const { data: config, error: cfgErr } = await supabase
    .from('xp_config')
    .select('base_xp, difficulty_weight')
    .eq('activity_type', activityType)
    .single();

  if (cfgErr || !config) {
    throw new Error(`Unknown activity type: ${activityType}`);
  }

  // 2. Fetch current streak multiplier (default 1.0 if no row yet)
  const { data: streakRow } = await supabase
    .from('user_streaks')
    .select('streak_multiplier, current_streak')
    .eq('user_id', userId)
    .single();

  const streakMultiplier: number = streakRow?.streak_multiplier ?? 1.0;

  // 3. Compute final XP  (mirrors SQL formula)
  const finalXP = Math.round(
    config.base_xp * config.difficulty_weight * streakMultiplier
  );

  // 4. Fetch current level BEFORE insert for level-up detection
  const { data: statsBefore } = await supabase
    .from('user_stats')
    .select('current_level, total_xp')
    .eq('user_id', userId)
    .single();

  const levelBefore = statsBefore?.current_level ?? 1;

  // 5. Insert into xp_ledger → triggers update user_stats + user_streaks
  const { error: ledgerErr } = await supabase.from('xp_ledger').insert({
    user_id:           userId,
    activity_type:     activityType,
    base_xp:           config.base_xp,
    difficulty_weight: config.difficulty_weight,
    streak_multiplier: streakMultiplier,
    final_xp:          finalXP,
    metadata:          metadata ?? null,
  });

  if (ledgerErr) throw ledgerErr;

  // 6. Fetch updated stats (triggers have run by now)
  const { data: statsAfter, error: statsErr } = await supabase
    .from('user_stats')
    .select('total_xp, current_level, xp_to_next_level')
    .eq('user_id', userId)
    .single();

  if (statsErr || !statsAfter) throw statsErr;

  // 7. Check for newly earned badges
  const newBadges = await checkAndAwardBadges(userId, activityType, streakRow?.current_streak ?? 0);

  return {
    finalXP,
    baseXP:           config.base_xp,
    difficultyWeight: config.difficulty_weight,
    streakMultiplier,
    newTotalXP:  statsAfter.total_xp,
    newLevel:    statsAfter.current_level,
    leveledUp:   statsAfter.current_level > levelBefore,
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

  const alreadyEarned = new Set((existing ?? []).map((r) => r.badge_key));

  // Fetch activity counts needed for badge evaluation
  const { data: counts } = await supabase
    .from('xp_ledger')
    .select('activity_type')
    .eq('user_id', userId);

  const activityCounts = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
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

  if (!alreadyEarned.has('first_cleanup') && (activityCounts['ocean_cleanup_basic'] ?? 0) >= 1)
    candidates.push('first_cleanup');

  if (!alreadyEarned.has('streak_3')  && currentStreak >= 3)  candidates.push('streak_3');
  if (!alreadyEarned.has('streak_7')  && currentStreak >= 7)  candidates.push('streak_7');
  if (!alreadyEarned.has('streak_30') && currentStreak >= 30) candidates.push('streak_30');

  if (!alreadyEarned.has('level_5')  && currentLevel >= 5)  candidates.push('level_5');
  if (!alreadyEarned.has('level_10') && currentLevel >= 10) candidates.push('level_10');

  if (!alreadyEarned.has('community_voice') && (activityCounts['community_post'] ?? 0) >= 10)
    candidates.push('community_voice');

  if (!alreadyEarned.has('eco_builder') && (activityCounts['eco_village_upgrade'] ?? 0) >= 5)
    candidates.push('eco_builder');

  if (!alreadyEarned.has('knowledge_seeker') && (activityCounts['learn_video'] ?? 0) >= 10)
    candidates.push('knowledge_seeker');

  if (candidates.length === 0) return [];

  // Batch-insert newly earned badges
  const { error } = await supabase.from('user_badges').insert(
    candidates.map((key) => ({ user_id: userId, badge_key: key }))
  );

  if (error) console.error('[EcoPlay] Badge insert error:', error);

  return candidates;
}

// ─── Stats Fetchers ───────────────────────────────────────────

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('user_id, total_xp, current_level, xp_to_next_level, activities_count')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    userId:          data.user_id,
    totalXP:         data.total_xp,
    currentLevel:    data.current_level,
    xpToNextLevel:   data.xp_to_next_level,
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
    currentStreak:    data?.current_streak    ?? 0,
    longestStreak:    data?.longest_streak    ?? 0,
    lastActivityDate: data?.last_activity_date ?? null,
    streakMultiplier: data?.streak_multiplier  ?? 1.0,
  };
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_key, earned_at, badges(name, description, icon)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
