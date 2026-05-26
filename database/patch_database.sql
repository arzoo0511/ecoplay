-- =========================================================================
-- EcoPlay Full Database Migration & Patch Script
-- Resolves missing columns, tables, RPCs, RLS policies, and triggers
-- =========================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. ALTER EXISTING TABLES (Safe, non-destructive alterations)
-- ─────────────────────────────────────────────────────────────────────────

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update community_replies table
ALTER TABLE community_replies ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES community_replies(id) ON DELETE CASCADE;

-- Update community_posts table
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS replies INTEGER DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_solved BOOLEAN DEFAULT FALSE;

-- Update game_scores table
ALTER TABLE game_scores ADD COLUMN IF NOT EXISTS level_reached INTEGER;

-- Update challenges table
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS recommendation_reason TEXT;

-- Update events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. CREATE NEW TABLES (If they do not already exist)
-- ─────────────────────────────────────────────────────────────────────────

-- Create user eco preferences table
CREATE TABLE IF NOT EXISTS user_eco_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  water_preference NUMERIC(4,2) DEFAULT 1.0,
  energy_preference NUMERIC(4,2) DEFAULT 1.0,
  waste_preference NUMERIC(4,2) DEFAULT 1.0,
  biodiversity_preference NUMERIC(4,2) DEFAULT 1.0,
  community_preference NUMERIC(4,2) DEFAULT 1.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community replies table
CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES community_replies(id) ON DELETE CASCADE,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community post likes table
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create XP config table
CREATE TABLE IF NOT EXISTS xp_config (
  id                SERIAL PRIMARY KEY,
  activity_type     TEXT           NOT NULL UNIQUE,
  base_xp           INT            NOT NULL DEFAULT 10,
  difficulty_weight NUMERIC(4,2)   NOT NULL DEFAULT 1.00,
  description       TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Seed XP config
INSERT INTO xp_config (activity_type, base_xp, difficulty_weight, description) VALUES
  ('ocean_cleanup_basic',   10, 1.00, 'Collect 1 piece of ocean trash'),
  ('ocean_cleanup_combo',   10, 1.50, 'Combo chain collection bonus'),
  ('ocean_cleanup_perfect', 50, 2.00, 'Perfect level completion'),
  ('daily_challenge',       30, 1.25, 'Complete a daily challenge'),
  ('eco_village_upgrade',   20, 1.10, 'Purchase an eco village upgrade'),
  ('community_post',        15, 1.00, 'Create a community post'),
  ('community_solution',    25, 1.20, 'Mark a post as solution'),
  ('learn_video',           20, 1.00, 'Watch a full educational video'),
  ('event_participation',   40, 1.30, 'Join an environmental event'),
  ('login_bonus',            5, 1.00, 'Daily login reward')
ON CONFLICT (activity_type) DO NOTHING;

-- Create level thresholds table
CREATE TABLE IF NOT EXISTS level_thresholds (
  level        INT     PRIMARY KEY,
  xp_required  BIGINT  NOT NULL,
  title        TEXT    NOT NULL,
  badge_icon   TEXT    NOT NULL
);

-- Seed Level Thresholds
INSERT INTO level_thresholds (level, xp_required, title, badge_icon) VALUES
  (1,     0,    'Seedling',       '🌱'),
  (2,   100,    'Sapling',        '🌿'),
  (3,   250,    'Sprout',         '🍀'),
  (4,   500,    'Leaf Keeper',    '🍃'),
  (5,   900,    'Green Guardian', '🌲'),
  (6,  1400,    'Eco Warrior',    '🌍'),
  (7,  2100,    'Nature Ally',    '🦋'),
  (8,  3000,    'Earth Defender', '🌊'),
  (9,  4200,    'Eco Champion',   '⚡'),
  (10, 6000,    'Planet Hero',    '🏆')
ON CONFLICT (level) DO NOTHING;

-- Create user streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak     INT         NOT NULL DEFAULT 0,
  longest_streak     INT         NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_multiplier  NUMERIC(4,2) GENERATED ALWAYS AS (
    CASE
      WHEN current_streak >= 30 THEN 3.00
      WHEN current_streak >= 14 THEN 2.50
      WHEN current_streak >= 7  THEN 2.00
      WHEN current_streak >= 3  THEN 1.50
      ELSE                           1.00
    END
  ) STORED,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create XP ledger table (Immutable audit log)
CREATE TABLE IF NOT EXISTS xp_ledger (
  id                BIGSERIAL    PRIMARY KEY,
  user_id           UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type     TEXT         NOT NULL,
  base_xp           INT          NOT NULL,
  difficulty_weight NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  streak_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  final_xp          INT          NOT NULL,
  metadata          JSONB,
  awarded_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Create XP Ledger Index
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_time ON xp_ledger (user_id, awarded_at DESC);

-- Create user stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id           UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp          BIGINT  NOT NULL DEFAULT 0,
  current_level     INT     NOT NULL DEFAULT 1,
  xp_to_next_level  INT     NOT NULL DEFAULT 100,
  activities_count  INT     NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user stats leaderboard index
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_leaderboard ON user_stats (total_xp DESC, user_id);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id          SERIAL PRIMARY KEY,
  key         TEXT   NOT NULL UNIQUE,
  name        TEXT   NOT NULL,
  description TEXT,
  icon        TEXT   NOT NULL,
  condition   TEXT   NOT NULL
);

-- Seed Badges
INSERT INTO badges (key, name, description, icon, condition) VALUES
  ('first_cleanup',    'First Dip',        'Complete your first ocean cleanup',    '🐠', 'ocean_cleanup_basic x1'),
  ('streak_3',         'Hot Streak',       '3-day activity streak',                '🔥', 'current_streak >= 3'),
  ('streak_7',         'Week Warrior',     '7-day activity streak',                '⚡', 'current_streak >= 7'),
  ('streak_30',        'Iron Eco',         '30-day unbroken streak',               '💎', 'current_streak >= 30'),
  ('level_5',          'Green Guardian',   'Reached Level 5',                      '🌲', 'current_level >= 5'),
  ('level_10',         'Planet Hero',      'Reached Level 10',                     '🏆', 'current_level >= 10'),
  ('combo_master',     'Combo Master',     'Achieved a 5x combo in ocean cleanup', '🌀', 'combo >= 5'),
  ('community_voice',  'Community Voice',  'Posted 10 community discussions',      '💬', 'community_post >= 10'),
  ('eco_builder',      'Eco Builder',      'Made 5 eco village upgrades',          '🏡', 'eco_village_upgrade >= 5'),
  ('knowledge_seeker', 'Knowledge Seeker', 'Watched 10 educational videos',        '📚', 'learn_video >= 10')
ON CONFLICT (key) DO NOTHING;

-- Create user badges table
CREATE TABLE IF NOT EXISTS user_badges (
  user_id    UUID   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key  TEXT   NOT NULL REFERENCES badges(key),
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_key)
);

-- Create bingo progress table
CREATE TABLE IF NOT EXISTS bingo_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. ENABLE ROW LEVEL SECURITY AND CONFIGURE RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_eco_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_progress ENABLE ROW LEVEL SECURITY;

-- users SELECT policy: Make profiles publicly readable to support display name joins
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);

-- community_posts policies
DROP POLICY IF EXISTS "Anyone can view posts" ON community_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can manage own posts" ON community_posts;

CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- community_replies policies
DROP POLICY IF EXISTS "Anyone can view replies" ON community_replies;
DROP POLICY IF EXISTS "Users can insert own replies" ON community_replies;

CREATE POLICY "Anyone can view replies" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Users can insert own replies" ON community_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- community_post_likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON community_post_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON community_post_likes;

CREATE POLICY "Anyone can view likes" ON community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON community_post_likes FOR ALL USING (auth.uid() = user_id);

-- user_eco_preferences policy
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_eco_preferences;
CREATE POLICY "Users can manage own preferences" ON user_eco_preferences FOR ALL USING (auth.uid() = user_id);

-- Read-only static lookup tables
DROP POLICY IF EXISTS "public_read_xp_config" ON xp_config;
CREATE POLICY "public_read_xp_config" ON xp_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_badges" ON badges;
CREATE POLICY "public_read_badges" ON badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_level_thresholds" ON level_thresholds;
CREATE POLICY "public_read_level_thresholds" ON level_thresholds FOR SELECT USING (true);

-- User-owned gamification policies
DROP POLICY IF EXISTS "own_streaks" ON user_streaks;
CREATE POLICY "own_streaks" ON user_streaks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_xp_ledger" ON xp_ledger;
CREATE POLICY "own_xp_ledger" ON xp_ledger FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_stats" ON user_stats;
CREATE POLICY "own_stats" ON user_stats FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_badges" ON user_badges;
CREATE POLICY "own_badges" ON user_badges FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "leaderboard_read" ON user_stats;
CREATE POLICY "leaderboard_read" ON user_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own bingo progress" ON bingo_progress;
CREATE POLICY "Users can view own bingo progress" ON bingo_progress FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. CREATE DATABASE FUNCTIONS AND TRIGGERS (Automated counts & updates)
-- ─────────────────────────────────────────────────────────────────────────

-- Trigger for community post replies count
CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET replies = COALESCE(replies, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET replies = GREATEST(0, COALESCE(replies, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_post_replies ON community_replies;
CREATE TRIGGER trg_update_post_replies
AFTER INSERT OR DELETE ON community_replies
FOR EACH ROW EXECUTE FUNCTION update_post_replies_count();

-- Trigger for community post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes = GREATEST(0, COALESCE(likes, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_post_likes ON community_post_likes;
CREATE TRIGGER trg_update_post_likes
AFTER INSERT OR DELETE ON community_post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger: auto-update user_stats after xp_ledger insert
CREATE OR REPLACE FUNCTION update_user_stats_on_xp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_total_xp        BIGINT;
  v_level           INT;
  v_xp_to_next      INT;
  v_next_threshold  BIGINT;
BEGIN
  -- Upsert base row if first ever award
  INSERT INTO user_stats (user_id) VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Accumulate total XP
  UPDATE user_stats
     SET total_xp         = total_xp + NEW.final_xp,
         activities_count = activities_count + 1,
         updated_at       = NOW()
   WHERE user_id = NEW.user_id
  RETURNING total_xp INTO v_total_xp;

  -- Recalculate level using level_thresholds
  SELECT COALESCE(MAX(level), 1)
    INTO v_level
    FROM level_thresholds
   WHERE xp_required <= v_total_xp;

  SELECT COALESCE(MIN(xp_required), v_total_xp + 999999)
    INTO v_next_threshold
    FROM level_thresholds
   WHERE xp_required > v_total_xp;

  v_xp_to_next := GREATEST(0, CAST(v_next_threshold - v_total_xp AS INT));

  UPDATE user_stats
     SET current_level    = v_level,
         xp_to_next_level = v_xp_to_next
   WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_stats_on_xp ON xp_ledger;
CREATE TRIGGER trg_update_stats_on_xp
  AFTER INSERT ON xp_ledger
  FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_xp();

-- Trigger: auto-update streaks on daily activity
CREATE OR REPLACE FUNCTION update_streak_on_activity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_today     DATE := CURRENT_DATE;
  v_last_date DATE;
  v_streak    INT;
BEGIN
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, v_today)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_activity_date, current_streak
    INTO v_last_date, v_streak
    FROM user_streaks
   WHERE user_id = NEW.user_id;

  IF v_last_date = v_today THEN
    -- Already counted today; no change needed
    RETURN NEW;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Consecutive day: extend streak
    UPDATE user_streaks
       SET current_streak     = current_streak + 1,
           longest_streak     = GREATEST(longest_streak, current_streak + 1),
           last_activity_date = v_today,
           updated_at         = NOW()
     WHERE user_id = NEW.user_id;
  ELSE
    -- Gap detected: reset streak
    UPDATE user_streaks
       SET current_streak     = 1,
           last_activity_date = v_today,
           updated_at         = NOW()
     WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_streak ON xp_ledger;
CREATE TRIGGER trg_update_streak
  AFTER INSERT ON xp_ledger
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_activity();

-- ─────────────────────────────────────────────────────────────────────────
-- 5. DEFINE DATABASE RPC FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────

-- Leaderboard Lookup RPC
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 10, p_offset INT DEFAULT 0)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_xp BIGINT,
  current_level INT,
  current_streak INT
) LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT
    DENSE_RANK() OVER (ORDER BY s.total_xp DESC) AS rank,
    s.user_id,
    COALESCE(u.name, 'Anonymous') AS username,
    u.avatar_url,
    s.total_xp,
    s.current_level,
    COALESCE(str.current_streak, 0) AS current_streak
  FROM user_stats s
  LEFT JOIN users u ON u.id = s.user_id
  LEFT JOIN user_streaks str ON str.user_id = s.user_id
  ORDER BY s.total_xp DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- User Rank Lookup RPC
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS BIGINT LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT rank
  FROM (
    SELECT user_id, DENSE_RANK() OVER (ORDER BY total_xp DESC) AS rank
    FROM user_stats
  ) ranked
  WHERE user_id = p_user_id;
$$;

-- Secure XP Award RPC
CREATE OR REPLACE FUNCTION award_xp_secure(p_activity_type TEXT, p_metadata JSONB DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_base_xp INT;
  v_diff_weight NUMERIC;
  v_streak_mult NUMERIC;
  v_final_xp INT;
  v_current_streak INT;
  v_new_total_xp BIGINT;
  v_new_level INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get config
  SELECT base_xp, difficulty_weight INTO v_base_xp, v_diff_weight
  FROM xp_config WHERE activity_type = p_activity_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown activity type';
  END IF;

  -- 2. Get streak multiplier (default 1.0)
  SELECT current_streak, streak_multiplier INTO v_current_streak, v_streak_mult
  FROM user_streaks WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    v_streak_mult := 1.0;
    v_current_streak := 0;
  END IF;

  -- 3. Compute XP
  v_final_xp := ROUND(v_base_xp * v_diff_weight * v_streak_mult);

  -- 4. Insert into ledger
  INSERT INTO xp_ledger (user_id, activity_type, base_xp, difficulty_weight, streak_multiplier, final_xp, metadata)
  VALUES (v_user_id, p_activity_type, v_base_xp, v_diff_weight, v_streak_mult, v_final_xp, p_metadata);

  -- 5. Fetch updated stats
  SELECT total_xp, current_level INTO v_new_total_xp, v_new_level
  FROM user_stats WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'final_xp', v_final_xp,
    'base_xp', v_base_xp,
    'difficulty_weight', v_diff_weight,
    'streak_multiplier', v_streak_mult,
    'new_total_xp', v_new_total_xp,
    'new_level', v_new_level,
    'current_streak', v_current_streak
  );
END;
$$;

-- Secure Game Score Save RPC
CREATE OR REPLACE FUNCTION save_game_score_secure(p_game_type TEXT, p_score INT, p_trash_collected INT DEFAULT 0)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_score > 1000000 THEN
    RAISE EXCEPTION 'Suspicious score rejected';
  END IF;

  INSERT INTO game_scores (user_id, game_type, score, trash_collected, created_at)
  VALUES (v_user_id, p_game_type, p_score, p_trash_collected, NOW());
END;
$$;

-- Secure Badge Award RPC
CREATE OR REPLACE FUNCTION award_badges_secure(p_badge_keys TEXT[])
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_key TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  FOREACH v_key IN ARRAY p_badge_keys
  LOOP
    INSERT INTO user_badges (user_id, badge_key)
    VALUES (v_user_id, v_key)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Community Stats RPC
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS JSONB AS $$
DECLARE
  v_members_count INTEGER;
  v_posts_count INTEGER;
  v_solved_count INTEGER;
  v_projects_count INTEGER;
  v_result JSONB;
BEGIN
  SELECT COUNT(*) INTO v_members_count FROM users;
  SELECT COUNT(*) INTO v_posts_count FROM community_posts;
  SELECT COUNT(DISTINCT id) INTO v_solved_count FROM community_posts WHERE is_solved = TRUE AND category = 'question';
  SELECT COUNT(DISTINCT id) INTO v_projects_count FROM community_posts WHERE category = 'project';
  
  v_result := jsonb_build_object(
    'membersCount', COALESCE(v_members_count, 0),
    'postsCount', COALESCE(v_posts_count, 0),
    'solvedCount', COALESCE(v_solved_count, 0),
    'projectsCount', COALESCE(v_projects_count, 0)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Community Post Likes RPC
CREATE OR REPLACE FUNCTION increment_post_likes(p_post_id UUID, p_increment BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF p_increment THEN
    INSERT INTO community_post_likes (post_id, user_id)
    VALUES (p_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
  ELSE
    DELETE FROM community_post_likes
    WHERE post_id = p_post_id AND user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. SETUP SUPABASE REALTIME REPLICATION
-- ─────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_replies;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_post_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_post_likes;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Silence errors if publication does not exist
END;
$$;
