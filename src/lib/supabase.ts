import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


// // Database types
// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   avatar_url?: string | null;
//   points: number;
//   level: number;
//   eco_score: number;
//   badges: string[];
//   created_at: string;
//   updated_at: string;
// }

export interface EcoVillage {
  id: string;
  user_id: string;
  air_quality: number;
  water_quality: number;
  biodiversity: number;
  trees: number;
  solar_panels: number;
  water_filters: number;
  pollution_level: number;
  wildlife: string[];
  created_at: string;
  updated_at: string;
}

export interface GameScore {
  id: string;
  user_id: string;
  game_type: 'ocean_cleanup' | 'quiz' | 'challenge';
  score: number;
  level: number;
  trash_collected?: number;
  perfect_cleanup?: boolean;
  created_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'ocean-cleanup' | 'quiz' | 'eco-action';
  points: number;
  completed: boolean;
  progress: number;
  created_at: string;
  completed_at?: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'cleanup' | 'workshop' | 'awareness' | 'education';
  participants: number;
  max_participants: number;
  organizer: string;
  image_url: string;
  created_at: string;
}

// Database functions
export const dbFunctions = {
  // User functions
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },

  async updateUserPoints(userId: string, points: number): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ 
        points: points,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user points:', error);
      return false;
    }
    
    return true;
  },

  // Eco Village functions
  async getEcoVillage(userId: string): Promise<EcoVillage | null> {
    const { data, error } = await supabase
      .from('eco_villages')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching eco village:', error);
      return null;
    }
    
    return data;
  },

  async updateEcoVillage(userId: string, updates: Partial<EcoVillage>): Promise<boolean> {
    const { error } = await supabase
      .from('eco_villages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating eco village:', error);
      return false;
    }
    
    return true;
  },

  // Game Score functions
  async saveGameScore(score: Omit<GameScore, 'id' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase.rpc('save_game_score_secure', {
      p_game_type: score.game_type,
      p_score: score.score,
      p_trash_collected: score.trash_collected ?? 0
    });
    
    if (error) {
      console.error('Error saving game score:', error);
      return false;
    }
    
    return true;
  },

  async getLeaderboard(gameType: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('game_scores')
      .select(`
        score,
        level,
        created_at,
        users (name)
      `)
      .eq('game_type', gameType)
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return data || [];
  },

  // Challenge functions
  async getUserChallenges(userId: string): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
    
    return data || [];
  },

  async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<boolean> {
    const { error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', challengeId);
    
    if (error) {
      console.error('Error updating challenge:', error);
      return false;
    }
    
    return true;
  },

  // Community functions
  async getCommunityPosts(limit: number = 20): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
    
    return data || [];
  },

  async createCommunityPost(post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('community_posts')
      .insert([{
        ...post,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error creating community post:', error);
      return false;
    }
    
    return true;
  },


  async updateCommunityPostLikes(postId: string, increment: boolean): Promise<boolean> {
    const { error } = await supabase.rpc('increment_post_likes', {
      p_post_id: postId,
      p_increment: increment
    });
    
    if (error) {
      console.error('Error updating post likes:', error);
      return false;
    }
    
    return true;
  },

  async addCommunityPostReply(postId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_post_replies', {
      p_post_id: postId
    });
    
    if (error) {
      console.error('Error updating post replies:', error);
      return false;
    }
    
    return true;
  },

  // Bingo Progress Functions
  async getBingoProgress(): Promise<Record<number, { tasks: [boolean, boolean, boolean] }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('bingo_progress')
      .select('state')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is row not found
      console.error('Error fetching bingo progress:', error);
      return {};
    }

    return data?.state || {};
  },

  async toggleBingoMission(goalIndex: number, taskIndex: number): Promise<Record<number, { tasks: [boolean, boolean, boolean] }> | null> {
    const { data, error } = await supabase.rpc('toggle_bingo_mission', {
      p_goal_index: goalIndex,
      p_task_index: taskIndex
    });

    if (error) {
      console.error('Error toggling bingo mission:', error);
      return null;
    }

    return data;
  },

  // Events functions
  async getEvents(limit: number = 20): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data || [];
  }
};