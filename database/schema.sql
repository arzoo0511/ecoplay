-- EcoPlay Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Users table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  eco_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: To apply this to an existing database, run:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Eco Villages table
CREATE TABLE IF NOT EXISTS eco_villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  air_quality INTEGER DEFAULT 20,
  water_quality INTEGER DEFAULT 20,
  biodiversity INTEGER DEFAULT 10,
  trees INTEGER DEFAULT 0,
  solar_panels INTEGER DEFAULT 0,
  water_filters INTEGER DEFAULT 0,
  pollution_level INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Game Scores table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  level_reached INTEGER,
  trash_collected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  likes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  author_name TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_solved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- replies is incremented by increment_post_replies() RPC (SECURITY DEFINER)
-- no direct app writes to this column

-- 6. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  -- 'date' mirrors event_date; kept for frontend query compatibility
  date TIMESTAMPTZ,
  time TEXT,
  type TEXT,
  participants INTEGER DEFAULT 0,
  max_participants INTEGER,
  organizer TEXT,
  image_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent re-run execution errors
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can manage own village" ON eco_villages;
DROP POLICY IF EXISTS "Users can manage own scores" ON game_scores;
DROP POLICY IF EXISTS "Users can manage own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can manage own posts" ON community_posts;
DROP POLICY IF EXISTS "Anyone can view events" ON events;

-- Define RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own village" ON eco_villages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scores" ON game_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own challenges" ON challenges FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);

-- ============================================================
-- Recommendation Engine Extensions
-- ============================================================

-- Alter challenges table to store recommendation metadata
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS recommendation_reason TEXT;

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

-- Enable RLS on preferences table
ALTER TABLE user_eco_preferences ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_eco_preferences;

-- Policy for preferences
CREATE POLICY "Users can manage own preferences" ON user_eco_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Community Section Extensions (Replies, Likes, Triggers, Stats)
-- ============================================================

-- 8. Community Replies table
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

-- 9. Community Post Likes table
CREATE TABLE IF NOT EXISTS community_post_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Enable RLS
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;

-- Drop policies if exists
DROP POLICY IF EXISTS "Anyone can view replies" ON community_replies;
DROP POLICY IF EXISTS "Users can insert own replies" ON community_replies;
DROP POLICY IF EXISTS "Users can update own replies" ON community_replies;
DROP POLICY IF EXISTS "Users can delete own replies" ON community_replies;

DROP POLICY IF EXISTS "Anyone can view post likes" ON community_post_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON community_post_likes;

-- Define Policies
CREATE POLICY "Anyone can view replies" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Users can insert own replies" ON community_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON community_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON community_replies FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view post likes" ON community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON community_post_likes FOR ALL USING (auth.uid() = user_id);

-- Triggers for automatic likes and replies counts
CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET replies = COALESCE(replies, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET replies = GREATEST(0, COALESCE(replies, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_post_replies ON community_replies;
CREATE TRIGGER trg_update_post_replies
  AFTER INSERT OR DELETE ON community_replies
  FOR EACH ROW EXECUTE FUNCTION update_post_replies_count();

CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes = GREATEST(0, COALESCE(likes, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_post_likes ON community_post_likes;
CREATE TRIGGER trg_update_post_likes
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- RPC for community platform statistics
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_members_count INT;
  v_posts_count INT;
  v_solved_count INT;
  v_projects_count INT;
BEGIN
  SELECT COUNT(*) INTO v_members_count FROM users;
  SELECT COUNT(*) INTO v_posts_count FROM community_posts;
  SELECT COUNT(DISTINCT id) INTO v_solved_count FROM community_posts WHERE is_solved = TRUE AND category = 'question';
  SELECT COUNT(DISTINCT id) INTO v_projects_count FROM community_posts WHERE category = 'project';

  RETURN jsonb_build_object(
    'members_count', v_members_count,
    'posts_count', v_posts_count,
    'solved_count', v_solved_count,
    'projects_count', v_projects_count
  );
END;
$$;

-- Enable Realtime for community tables
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE community_post_likes;
