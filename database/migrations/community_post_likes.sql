-- Migration: per-user community post likes dedup (issue #224)
--
-- Before this migration, `increment_post_likes` did an unconditional +1/-1
-- on `community_posts.likes` with no auth.uid() check and no per-user
-- dedup, so any authenticated user could inflate a post's like counter
-- arbitrarily by refreshing the client (which reset the in-memory
-- `likedPosts` Set) and hitting the like button again. A user could also
-- silently DECREMENT a post they never liked (because the RPC didn't
-- track who liked what), corrupting the counter downward.
--
-- This migration:
--   1. Creates `community_post_likes(user_id, post_id)` with a composite
--      primary key so each (user, post) combination can appear at most once.
--   2. Enables RLS so users can only insert/delete their own likes.
--   3. Rewrites `increment_post_likes` as SECURITY DEFINER using
--      auth.uid(): INSERT ... ON CONFLICT DO NOTHING for like, DELETE for
--      unlike, and recomputes `community_posts.likes = count(*)` inside the
--      same statement so the counter always matches the ledger.

-- 1. Ledger table
CREATE TABLE IF NOT EXISTS community_post_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS community_post_likes_post_idx
  ON community_post_likes (post_id);

-- 2. RLS
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_post_likes_select ON community_post_likes;
CREATE POLICY community_post_likes_select
  ON community_post_likes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS community_post_likes_modify_own ON community_post_likes;
CREATE POLICY community_post_likes_modify_own
  ON community_post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. RPC rewrite
CREATE OR REPLACE FUNCTION increment_post_likes(p_post_id UUID, p_increment BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_increment THEN
    INSERT INTO community_post_likes (user_id, post_id)
    VALUES (v_user_id, p_post_id)
    ON CONFLICT (user_id, post_id) DO NOTHING;
  ELSE
    DELETE FROM community_post_likes
    WHERE user_id = v_user_id AND post_id = p_post_id;
  END IF;

  -- Recompute the aggregate from the ledger so the counter can never
  -- drift from the underlying rows even under concurrent taps.
  UPDATE community_posts
  SET likes = (
    SELECT COUNT(*)::INT
    FROM community_post_likes
    WHERE post_id = p_post_id
  )
  WHERE id = p_post_id;
END;
$$;

-- Companion RPC so the client can hydrate `likedPosts` on mount from the
-- authoritative source instead of starting from an empty in-memory Set.
CREATE OR REPLACE FUNCTION get_user_liked_post_ids()
RETURNS TABLE(post_id UUID) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT post_id FROM community_post_likes WHERE user_id = auth.uid();
$$;
