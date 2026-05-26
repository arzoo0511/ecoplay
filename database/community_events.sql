-- ============================================================
-- EcoPlay Community Eco Events & Seasonal Challenges
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Community Events table
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL DEFAULT 'green', -- 'green', 'blue', 'cyan'
  icon TEXT NOT NULL DEFAULT '🌍',
  goal INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'actions',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  xp_reward INTEGER DEFAULT 500,
  badge_id TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  is_seasonal BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Event Participation table
CREATE TABLE IF NOT EXISTS event_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE NOT NULL,
  contribution INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  rewards_claimed TEXT[] DEFAULT '{}'::TEXT[],
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can select community events" ON community_events;
CREATE POLICY "Anyone can select community events" ON community_events 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view all event participations" ON event_participation;
CREATE POLICY "Users can view all event participations" ON event_participation 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own event participation" ON event_participation;
CREATE POLICY "Users can manage own event participation" ON event_participation 
  FOR ALL USING (auth.uid() = user_id);

-- Seed Data (3 Demo/Weekly/Seasonal Events)
INSERT INTO community_events (title, description, theme, icon, goal, unit, start_date, end_date, xp_reward, badge_id, milestones, is_seasonal, is_active)
VALUES
  (
    'Plant 10,000 Trees Week',
    'Join players worldwide in a collective effort to plant 10,000 trees. Every tree you plant in your Eco Village contributes directly to the global community goal!',
    'green',
    '🌳',
    10000,
    'trees',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    500,
    'eco_planter',
    '[
      {"at": 2500, "label": "Seedling Stage", "xpBonus": 50},
      {"at": 5000, "label": "Sapling Stage", "xpBonus": 100},
      {"at": 7500, "label": "Young Forest", "xpBonus": 150},
      {"at": 10000, "label": "Full Forest 🎉", "xpBonus": 200}
    ]'::jsonb,
    FALSE,
    TRUE
  ),
  (
    'Zero Plastic Challenge',
    'Commit to reducing single-use plastics! Log ocean cleanups or eco-actions to remove plastic waste and unlock milestones.',
    'blue',
    '♻️',
    50000,
    'pledges',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '29 days',
    1000,
    'zero_plastic_hero',
    '[
      {"at": 10000, "label": "Awareness Stage", "xpBonus": 100},
      {"at": 25000, "label": "Commitment Stage", "xpBonus": 200},
      {"at": 40000, "label": "Impact Stage", "xpBonus": 300},
      {"at": 50000, "label": "Ocean Saved! 🌊", "xpBonus": 400}
    ]'::jsonb,
    TRUE,
    TRUE
  ),
  (
    'Clean Water Mission',
    'Upgrade your water systems and conserve water. Help ensure clean water access for all villages by hitting our community filtration milestone.',
    'cyan',
    '💧',
    25000,
    'filtration actions',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '17 days',
    750,
    'water_guardian',
    '[
      {"at": 5000, "label": "Drop by Drop", "xpBonus": 75},
      {"at": 12500, "label": "River Rising", "xpBonus": 150},
      {"at": 20000, "label": "Stream Strong", "xpBonus": 225},
      {"at": 25000, "label": "Ocean United! 💧", "xpBonus": 300}
    ]'::jsonb,
    TRUE,
    TRUE
  )
ON CONFLICT DO NOTHING;
