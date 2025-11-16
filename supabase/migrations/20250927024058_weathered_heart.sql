-- EcoPlay Database Schema
-- This file contains the complete database structure for the EcoPlay platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    eco_score INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eco Villages table
CREATE TABLE eco_villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    air_quality INTEGER DEFAULT 20,
    water_quality INTEGER DEFAULT 20,
    biodiversity INTEGER DEFAULT 10,
    trees INTEGER DEFAULT 0,
    solar_panels INTEGER DEFAULT 0,
    water_filters INTEGER DEFAULT 0,
    pollution_level INTEGER DEFAULT 80,
    wildlife TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Scores table
CREATE TABLE game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL, -- 'ocean_cleanup', 'quiz', 'challenge'
    score INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    trash_collected INTEGER,
    perfect_cleanup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'ocean-cleanup', 'quiz', 'eco-action'
    points INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Community Posts table
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'cleanup', 'workshop', 'awareness', 'education'
    participants INTEGER DEFAULT 0,
    max_participants INTEGER NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Event Participation table
CREATE TABLE user_event_participation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Community Post Replies table
CREATE TABLE community_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Post Likes table
CREATE TABLE community_post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_eco_villages_user_id ON eco_villages(user_id);
CREATE INDEX idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX idx_game_scores_type_score ON game_scores(game_type, score DESC);
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_community_replies_post_id ON community_replies(post_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_participation ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Eco villages policies
CREATE POLICY "Users can read own eco village" ON eco_villages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own eco village" ON eco_villages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own eco village" ON eco_villages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game scores policies
CREATE POLICY "Users can read own game scores" ON game_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game scores" ON game_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read leaderboard" ON game_scores
    FOR SELECT USING (true);

-- Challenges policies
CREATE POLICY "Users can read own challenges" ON challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON challenges
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Anyone can read community posts" ON community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Community replies policies
CREATE POLICY "Anyone can read replies" ON community_replies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own replies" ON community_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON community_replies
    FOR UPDATE USING (auth.uid() = user_id);

-- Community post likes policies
CREATE POLICY "Anyone can read likes" ON community_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON community_post_likes
    FOR ALL USING (auth.uid() = user_id);

-- Events policies (public read)
CREATE POLICY "Anyone can read events" ON events
    FOR SELECT USING (true);

-- User event participation policies
CREATE POLICY "Users can read own participation" ON user_event_participation
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own participation" ON user_event_participation
    FOR ALL USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eco_villages_updated_at BEFORE UPDATE ON eco_villages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development
INSERT INTO events (title, description, date, time, location, type, participants, max_participants, organizer, image_url) VALUES
('Beach Cleanup Drive', 'Join us for a community beach cleanup to protect marine life and keep our coastlines beautiful.', '2025-01-25', '09:00', 'Santa Monica Beach, CA', 'cleanup', 45, 100, 'Ocean Guardians', 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg'),
('Solar Panel Installation Workshop', 'Learn how to install solar panels and reduce your carbon footprint with this hands-on workshop.', '2025-01-28', '14:00', 'Community Center, Portland, OR', 'workshop', 28, 50, 'Green Energy Initiative', 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg'),
('Climate Action March', 'Peaceful march to raise awareness about climate change and demand environmental action.', '2025-02-01', '11:00', 'City Hall, New York, NY', 'awareness', 156, 500, 'Youth Climate Alliance', 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg');