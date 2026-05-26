/**
 * EcoPlay Leaderboard Service
 * Issue #4 – Paginated DENSE_RANK leaderboard endpoints
 *
 * Uses a Supabase RPC (Postgres function) so DENSE_RANK() runs
 * server-side – never pulls all rows to the client.
 */

import { supabase } from './supabase';
import type { LeaderboardEntry } from './gamification';

export interface LeaderboardPage {
  entries: LeaderboardEntry[];
  total:   number;
  page:    number;
  perPage: number;
}

// ─── Supabase RPC: get_leaderboard ───────────────────────────
// Call this ONCE in Supabase SQL editor to register the function:
//
// CREATE OR REPLACE FUNCTION get_leaderboard(
//   p_limit INT DEFAULT 10,
//   p_offset INT DEFAULT 0
// )
// RETURNS TABLE (
//   rank          BIGINT,
//   user_id       UUID,
//   username      TEXT,
//   avatar_url    TEXT,
//   total_xp      BIGINT,
//   current_level INT,
//   current_streak INT
// ) LANGUAGE SQL STABLE SECURITY DEFINER AS $$
//   SELECT
//     DENSE_RANK() OVER (ORDER BY s.total_xp DESC) AS rank,
//     s.user_id,
//     COALESCE(u.name, 'Anonymous') AS username,
//     u.avatar_url,
//     s.total_xp,
//     s.current_level,
//     COALESCE(str.current_streak, 0) AS current_streak
//   FROM user_stats s
//   LEFT JOIN users u ON u.id = s.user_id
//   LEFT JOIN user_streaks str ON str.user_id = s.user_id
//   ORDER BY s.total_xp DESC
//   LIMIT  p_limit
//   OFFSET p_offset;
// $$;
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a paginated leaderboard using DENSE_RANK() on the server.
 */
export async function getLeaderboard(
  page    = 1,
  perPage = 20
): Promise<LeaderboardPage> {
  const offset = (page - 1) * perPage;

  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_limit:  perPage,
    p_offset: offset,
  });

  if (error) throw error;

  const entries: LeaderboardEntry[] = (data ?? []).map((row: any) => ({
    rank:          Number(row.rank),
    userId:        row.user_id,
    username:      row.username ?? 'Anonymous',
    avatarUrl:     row.avatar_url ?? null,
    totalXP:       row.total_xp,
    currentLevel:  row.current_level,
    currentStreak: row.current_streak,
  }));

  // Get total count for pagination metadata
  const { count } = await supabase
    .from('user_stats')
    .select('*', { count: 'exact', head: true });

  return {
    entries,
    total:   count ?? 0,
    page,
    perPage,
  };
}

/**
 * Get a single user's leaderboard rank.
 * Efficient: only runs the DENSE_RANK subquery for one user.
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_user_rank', {
    p_user_id: userId,
  });

  // Fallback RPC:
  // CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
  // RETURNS BIGINT LANGUAGE SQL STABLE AS $$
  //   SELECT rank FROM (
  //     SELECT user_id, DENSE_RANK() OVER (ORDER BY total_xp DESC) AS rank
  //     FROM user_stats
  //   ) ranked WHERE user_id = p_user_id;
  // $$;

  if (error) {
    console.error('[EcoPlay] getUserRank error:', error);
    return null;
  }
  return data ?? null;
}

/**
 * Get the top N users (used for the dashboard podium widget).
 */
export async function getTopPlayers(n = 3): Promise<LeaderboardEntry[]> {
  const page = await getLeaderboard(1, n);
  return page.entries;
}
