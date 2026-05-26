-- ============================================================
-- EcoPlay Gamification Reward System  –  Schema Migration
-- Issue #4: Dynamic XP, Streaks, Badges, Leaderboard
-- ============================================================

-- ─── 1. XP CONFIG TABLE ──────────────────────────────────────
-- Admins tune base XP and difficulty weights without code deploys
CREATE TABLE IF NOT EXISTS xp_config (
  id                SERIAL PRIMARY KEY,
  activity_type     TEXT           NOT NULL UNIQUE,
  base_xp           INT            NOT NULL DEFAULT 10,
  difficulty_weight NUMERIC(4,2)   NOT NULL DEFAULT 1.00,
  description       TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

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

-- ─── 2. LEVEL THRESHOLDS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS level_thresholds (
  level        INT     PRIMARY KEY,
  xp_required  BIGINT  NOT NULL,
  title        TEXT    NOT NULL,
  badge_icon   TEXT    NOT NULL
);

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

-- ─── 3. USER STREAKS ─────────────────────────────────────────
-- One row per user. Generated column computes multiplier from streak.
-- Avoids data-race anomalies: last_activity_date gates daily updates.
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

-- ─── 4. XP LEDGER (IMMUTABLE AUDIT LOG) ──────────────────────
-- Append-only. Every XP award is recorded here for full auditability.
CREATE TABLE IF NOT EXISTS xp_ledger (
  id                BIGSERIAL    PRIMARY KEY,
  user_id           UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type     TEXT         NOT NULL,
  base_xp           INT          NOT NULL,
  difficulty_weight NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  streak_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  final_xp          INT          NOT NULL,  -- ROUND(base * diff_weight * streak_mult)
  metadata          JSONB,                  -- e.g. {"combo":3,"score":540}
  awarded_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Composite index for per-user history (most recent first)
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_time
  ON xp_ledger (user_id, awarded_at DESC);

-- ─── 5. USER STATS (DENORMALISED CACHE) ──────────────────────
-- Maintained by trigger below. Never write from app code directly.
CREATE TABLE IF NOT EXISTS user_stats (
  user_id           UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp          BIGINT  NOT NULL DEFAULT 0,
  current_level     INT     NOT NULL DEFAULT 1,
  xp_to_next_level  INT     NOT NULL DEFAULT 100,
  activities_count  INT     NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for leaderboard: DENSE_RANK() sorts by total_xp DESC
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_leaderboard
  ON user_stats (total_xp DESC, user_id);

-- ─── 6. BADGES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          SERIAL PRIMARY KEY,
  key         TEXT   NOT NULL UNIQUE,
  name        TEXT   NOT NULL,
  description TEXT,
  icon        TEXT   NOT NULL,
  condition   TEXT   NOT NULL  -- human-readable unlock condition
);

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

-- ─── 7. USER BADGES (EARNED) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  user_id    UUID   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key  TEXT   NOT NULL REFERENCES badges(key),
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_key)
);

-- ─── 8. TRIGGER: auto-update user_stats after xp_ledger insert ──
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

-- ─── 9. TRIGGER: auto-update streaks on daily activity ───────
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

-- ─── 10. ROW LEVEL SECURITY ──────────────────────────────────
ALTER TABLE xp_config        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_thresholds  ENABLE ROW LEVEL SECURITY;

-- Public read-only tables
DROP POLICY IF EXISTS "public_read_xp_config" ON xp_config;
CREATE POLICY "public_read_xp_config"       ON xp_config       FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_badges" ON badges;
CREATE POLICY "public_read_badges"          ON badges           FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_level_thresholds" ON level_thresholds;
CREATE POLICY "public_read_level_thresholds" ON level_thresholds FOR SELECT USING (true);

-- Users can only read/write their own rows
DROP POLICY IF EXISTS "own_streaks" ON user_streaks;
CREATE POLICY "own_streaks"     ON user_streaks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_xp_ledger" ON xp_ledger;
CREATE POLICY "own_xp_ledger"   ON xp_ledger    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_stats" ON user_stats;
CREATE POLICY "own_stats"       ON user_stats   FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_badges" ON user_badges;
CREATE POLICY "own_badges"      ON user_badges  FOR ALL USING (auth.uid() = user_id);

-- Leaderboard: everyone can read stats (for rankings), but only owners write
DROP POLICY IF EXISTS "leaderboard_read" ON user_stats;
CREATE POLICY "leaderboard_read" ON user_stats  FOR SELECT USING (true);

-- ─── 7. BINGO PROGRESS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bingo_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bingo_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bingo progress" ON bingo_progress FOR SELECT USING (auth.uid() = user_id);
