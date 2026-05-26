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

export interface Milestone {
  at: number;
  label: string;
  xpBonus: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  theme: string;
  icon: string;
  goal: number;
  unit: string;
  start_date: string;
  end_date: string;
  xp_reward: number;
  badge_id?: string | null;
  milestones: Milestone[];
  is_seasonal: boolean;
  is_active: boolean;
  created_at: string;
  status?: 'active' | 'upcoming' | 'ended';
  communityProgress?: number;
  participantCount?: number;
}

export interface EventParticipation {
  id: string;
  user_id: string;
  event_id: string;
  contribution: number;
  joined_at: string;
  completed_at?: string | null;
  rewards_claimed: string[];
}

export interface EventHistoryRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  eventIcon: string;
  eventTheme: string;
  status: 'active' | 'ended';
  userContribution: number;
  communityProgress: number;
  goal: number;
  unit: string;
  participantCount: number;
  joinedAt: string;
  completedAt?: string | null;
  rewardsClaimed: string[];
  unlockedMilestones: Milestone[];
  xpReward: number;
  badgeId?: string | null;
  goalReached: boolean;
  startDate: string;
  endDate: string;
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
  },

  // Community Events functions
  async getCommunityEvents(userId?: string): Promise<{ events: CommunityEvent[]; participation: Record<string, number> }> {
    try {
      const now = new Date();

      // Fetch all community events
      const { data: events, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      if (!events || events.length === 0) return { events: [], participation: {} };

      const enrichedEvents: CommunityEvent[] = [];
      const userParticipation: Record<string, number> = {};

      for (const event of events) {
        // Aggregate total community progress
        const { data: participations, error: partError } = await supabase
          .from('event_participation')
          .select('contribution, user_id')
          .eq('event_id', event.id);

        if (partError) throw partError;

        let communityProgress = 0;
        const uniqueParticipants = new Set<string>();

        if (participations) {
          participations.forEach((p) => {
            communityProgress += p.contribution || 0;
            if (p.user_id) uniqueParticipants.add(p.user_id);
          });
        }

        // Determine derived status
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        let status: 'active' | 'upcoming' | 'ended' = 'active';

        if (now < start) {
          status = 'upcoming';
        } else if (now > end) {
          status = 'ended';
        }

        // Parse milestones from JSONB
        let milestones: Milestone[] = [];
        if (typeof event.milestones === 'string') {
          try {
            milestones = JSON.parse(event.milestones);
          } catch {
            milestones = [];
          }
        } else if (Array.isArray(event.milestones)) {
          milestones = event.milestones;
        }

        enrichedEvents.push({
          ...event,
          status,
          communityProgress,
          participantCount: uniqueParticipants.size,
          milestones,
        });

        // If userId is provided, extract user contribution
        if (userId && participations) {
          const userPart = participations.find((p) => p.user_id === userId);
          if (userPart) {
            userParticipation[event.id] = userPart.contribution || 0;
          }
        }
      }

      // Sort: active first, then upcoming, then ended
      const order = { active: 0, upcoming: 1, ended: 2 };
      enrichedEvents.sort((a, b) => (order[a.status!] ?? 0) - (order[b.status!] ?? 0));

      return { events: enrichedEvents, participation: userParticipation };
    } catch (e) {
      console.error('Error fetching community events:', e);
      return { events: [], participation: {} };
    }
  },

  async getEventParticipation(userId: string, eventId: string): Promise<EventParticipation | null> {
    const { data, error } = await supabase
      .from('event_participation')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching event participation:', error);
      return null;
    }
    return data;
  },

  async contributeToEvent(
    userId: string,
    eventId: string,
    amount: number
  ): Promise<{
    success: boolean;
    contribution: number;
    communityProgress: number;
    xpAwarded: number;
    milestonesUnlocked: Milestone[];
    goalReached: boolean;
    error?: string;
  }> {
    try {
      // 1. Fetch event
      const { data: event, error: eventErr } = await supabase
        .from('community_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventErr || !event) throw new Error('Event not found');

      const now = new Date();
      if (now < new Date(event.start_date)) throw new Error('Event has not started yet');
      if (now > new Date(event.end_date)) throw new Error('Event has already ended');

      // 2. Fetch existing user participation
      const { data: existingPart } = await supabase
        .from('event_participation')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      let prevContribution = 0;
      let newContribution = amount;
      let partId = '';

      if (existingPart) {
        prevContribution = existingPart.contribution || 0;
        newContribution = prevContribution + amount;
        partId = existingPart.id;

        const { error: updateErr } = await supabase
          .from('event_participation')
          .update({
            contribution: newContribution,
          })
          .eq('id', partId);

        if (updateErr) throw updateErr;
      } else {
        const { data: newPart, error: insertErr } = await supabase
          .from('event_participation')
          .insert({
            user_id: userId,
            event_id: eventId,
            contribution: amount,
            joined_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        newContribution = amount;
        partId = newPart.id;
      }

      // 3. Compute total community progress
      const { data: allPart, error: allPartErr } = await supabase
        .from('event_participation')
        .select('contribution')
        .eq('event_id', eventId);

      if (allPartErr) throw allPartErr;

      let communityTotal = 0;
      allPart.forEach((p) => {
        communityTotal += p.contribution || 0;
      });

      const prevCommunityTotal = communityTotal - amount;

      // 4. Parse milestones
      let milestones: Milestone[] = [];
      if (typeof event.milestones === 'string') {
        try {
          milestones = JSON.parse(event.milestones);
        } catch {
          milestones = [];
        }
      } else if (Array.isArray(event.milestones)) {
        milestones = event.milestones;
      }

      // 5. Detect milestone unlocks
      const milestonesUnlocked: Milestone[] = [];
      let totalXpAwarded = 0;

      milestones.forEach((m) => {
        if (prevCommunityTotal < m.at && communityTotal >= m.at) {
          milestonesUnlocked.push(m);
          totalXpAwarded += m.xpBonus || 0;
        }
      });

      // 6. Detect event goal completion
      let goalReached = false;
      if (prevCommunityTotal < event.goal && communityTotal >= event.goal) {
        goalReached = true;
        totalXpAwarded += event.xp_reward || 0;

        await supabase
          .from('event_participation')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', partId);
      }

      // 7. Base XP award (5 XP per unit contribution, capped at 50 base XP)
      const baseXp = Math.min(amount * 5, 50);

      // Award XP via secure RPC
      const totalToAward = totalXpAwarded + baseXp;

      return {
        success: true,
        contribution: newContribution,
        communityProgress: communityTotal,
        xpAwarded: totalToAward,
        milestonesUnlocked,
        goalReached,
      };
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error contributing to community event:', error);
      return {
        success: false,
        contribution: 0,
        communityProgress: 0,
        xpAwarded: 0,
        milestonesUnlocked: [],
        goalReached: false,
        error: error.message || 'Failed to record contribution',
      };
    }
  },

  async getEventHistory(userId: string): Promise<EventHistoryRecord[]> {
    try {
      const { data: participations, error: partError } = await supabase
        .from('event_participation')
        .select('*')
        .eq('user_id', userId);

      if (partError) throw partError;
      if (!participations || participations.length === 0) return [];

      const history: EventHistoryRecord[] = [];

      for (const part of participations) {
        const { data: event, error: eventErr } = await supabase
          .from('community_events')
          .select('*')
          .eq('id', part.event_id)
          .single();

        if (eventErr || !event) continue;

        // Compute community total
        const { data: allPart, error: allPartErr } = await supabase
          .from('event_participation')
          .select('contribution, user_id')
          .eq('event_id', part.event_id);

        if (allPartErr) continue;

        let communityTotal = 0;
        allPart.forEach((p) => {
          communityTotal += p.contribution || 0;
        });

        // Parse milestones
        let milestones: Milestone[] = [];
        if (typeof event.milestones === 'string') {
          try {
            milestones = JSON.parse(event.milestones);
          } catch {
            milestones = [];
          }
        } else if (Array.isArray(event.milestones)) {
          milestones = event.milestones;
        }

        const unlockedMilestones = milestones.filter((m) => communityTotal >= m.at);
        const now = new Date();
        const endDate = new Date(event.end_date);
        const status = now > endDate ? 'ended' : 'active';

        history.push({
          id: part.id,
          eventId: part.event_id,
          eventTitle: event.title,
          eventIcon: event.icon,
          eventTheme: event.theme,
          status,
          userContribution: part.contribution || 0,
          communityProgress: communityTotal,
          goal: event.goal,
          unit: event.unit,
          participantCount: allPart.length,
          joinedAt: part.joined_at,
          completedAt: part.completed_at,
          rewardsClaimed: part.rewards_claimed || [],
          unlockedMilestones,
          xpReward: event.xp_reward || 500,
          badgeId: event.badge_id,
          goalReached: communityTotal >= event.goal,
          startDate: event.start_date,
          endDate: event.end_date,
        });
      }

      // Sort: most recent first
      history.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

      return history;
    } catch (e) {
      console.error('Error fetching event history:', e);
      return [];
    }
  }
};