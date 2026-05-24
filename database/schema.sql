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
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own village" ON eco_villages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scores" ON game_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own challenges" ON challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own posts" ON community_posts FOR ALL USING (auth.uid() = user_id);
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
