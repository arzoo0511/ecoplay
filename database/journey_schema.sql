-- ============================================================
-- AI Sustainability Journey & Milestones Schema
-- Extends the gamification and core schema for the Eco Journey feature
-- ============================================================

-- ─── 1. NEW MILESTONE BADGES ─────────────────────────────────
INSERT INTO badges (key, name, description, icon, condition) VALUES
  ('plastic_free',    'Plastic-Free Champion', 'Avoided single-use plastics for 10 days', '♻️', 'plastic_free_days >= 10'),
  ('water_saver',     'Water Saver Pro',       'Saved 1000 liters of water',              '💧', 'water_saved >= 1000'),
  ('green_transport', 'Green Transport Hero',  'Used green transport 20 times',           '🚲', 'green_trips >= 20'),
  ('recycling_master','Recycling Master',      'Recycled 50 items',                       '🔄', 'items_recycled >= 50'),
  ('zero_waste',      'Zero Waste Explorer',   'Completed 5 zero-waste challenges',       '🌍', 'zero_waste_challenges >= 5')
ON CONFLICT (key) DO NOTHING;

-- ─── 2. USER SUSTAINABILITY JOURNEYS ─────────────────────────
-- Tracks personalized eco goals, predicted scores, and journey metrics
CREATE TABLE IF NOT EXISTS user_journeys (
  user_id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  predicted_score        INT         NOT NULL DEFAULT 0,
  consistency_trend      TEXT        NOT NULL DEFAULT 'Stable', -- 'Improving', 'Declining', 'Stable'
  streak_loss_probability NUMERIC(4,2) NOT NULL DEFAULT 0.0,
  weekly_goals           JSONB       NOT NULL DEFAULT '[]'::jsonb, -- Array of personalized goals
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;

-- User can view and update their own journey
DROP POLICY IF EXISTS "Users can manage own journey" ON user_journeys;
CREATE POLICY "Users can manage own journey" ON user_journeys FOR ALL USING (auth.uid() = user_id);

-- ─── 3. MILESTONE REWARDS (EXTENDING USERS) ──────────────────
-- Adds a profile_frame column if we want to showcase "Special profile frames"
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='profile_frame') THEN
    ALTER TABLE users ADD COLUMN profile_frame TEXT DEFAULT 'default';
  END IF;
END $$;

-- ─── 4. GLOBAL SUSTAINABILITY RANKING VIEW ───────────────────
-- View to easily fetch leaderboard information for "Community Sustainability Ranking"
CREATE OR REPLACE VIEW global_sustainability_ranking AS
SELECT 
  s.user_id,
  u.name,
  u.avatar_url,
  s.total_xp,
  s.current_level,
  u.eco_score,
  DENSE_RANK() OVER (ORDER BY s.total_xp DESC, u.eco_score DESC) as rank
FROM user_stats s
JOIN users u ON s.user_id = u.id;

-- ─── 5. ECO JOURNEY TIMELINE RPC ─────────────────────────────
-- Fetches recent activities for the visual timeline
CREATE OR REPLACE FUNCTION get_user_timeline(p_user_id UUID, p_limit INT DEFAULT 20)
RETURNS TABLE (
  id BIGINT,
  activity_type TEXT,
  xp_awarded INT,
  metadata JSONB,
  timestamp TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    x.id,
    x.activity_type,
    x.final_xp AS xp_awarded,
    x.metadata,
    x.awarded_at AS timestamp
  FROM xp_ledger x
  WHERE x.user_id = p_user_id
  ORDER BY x.awarded_at DESC
  LIMIT p_limit;
END;
$$;
