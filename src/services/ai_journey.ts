import { supabase } from '../lib/supabase';

export interface EcoGoal {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

export interface UserJourneyContext {
  userId: string;
  currentStreak: number;
  totalXp: number;
  currentLevel: number;
  activitiesCount: number;
}

export interface JourneyStats {
  predictedScore: number;
  consistencyTrend: 'Improving' | 'Declining' | 'Stable';
  streakLossProbability: number;
  weeklyGoals: EcoGoal[];
  motivationMessage: string;
}

/**
 * Simulates an AI Engine by analyzing the user's gamification stats and streaks
 * to generate personalized goals and motivation.
 */
export async function getOrGenerateJourney(userId: string): Promise<JourneyStats> {
  try {
    // Fetch user stats and streaks
    const [statsRes, streakRes] = await Promise.all([
      supabase.from('user_stats').select('*').eq('user_id', userId).single(),
      supabase.from('user_streaks').select('*').eq('user_id', userId).single()
    ]);

    if (statsRes.error && statsRes.error.code !== 'PGRST116') {
      console.warn('[Journey] Failed to fetch user stats:', statsRes.error.message);
    }
    if (streakRes.error && streakRes.error.code !== 'PGRST116') {
      console.warn('[Journey] Failed to fetch user streaks:', streakRes.error.message);
    }

    const currentStreak = streakRes.data?.current_streak || 0;
    const currentLevel = statsRes.data?.current_level || 1;
    const activitiesCount = statsRes.data?.activities_count || 0;

    // 1. Sustainability Score Prediction
    // Base score is current level * 100 + streak * 50
    const predictedScore = Math.min(10000, currentLevel * 100 + currentStreak * 50 + activitiesCount * 10);
    
    // 2. Consistency Trend & Streak Loss Probability
    let consistencyTrend: 'Improving' | 'Declining' | 'Stable' = 'Stable';
    let streakLossProbability = 0;

    if (currentStreak > 7) {
      consistencyTrend = 'Improving';
      streakLossProbability = 5; // Very low
    } else if (currentStreak > 3) {
      consistencyTrend = 'Improving';
      streakLossProbability = 15;
    } else if (currentStreak === 0 && activitiesCount > 0) {
      consistencyTrend = 'Declining';
      streakLossProbability = 80;
    } else {
      consistencyTrend = 'Stable';
      streakLossProbability = 50;
    }

    // 3. Smart Motivation Engine
    let motivationMessage = '';
    if (consistencyTrend === 'Improving') {
      motivationMessage = `You're on a ${currentStreak}-day streak! Your eco-habits are making a real impact. Keep it up! 🌍`;
    } else if (consistencyTrend === 'Declining') {
      motivationMessage = `It's been a while since your last eco-action. Let's get back on track today! 🌱`;
    } else {
      motivationMessage = `Every small action counts. What eco-friendly choice will you make today? 💚`;
    }

    // 4. Generate Weekly Goals
    const weeklyGoals: EcoGoal[] = [];
    if (currentLevel < 3) {
      weeklyGoals.push({ id: 'g1', title: 'Start Recycling', description: 'Log your first recycled item', xpReward: 50, completed: false });
      weeklyGoals.push({ id: 'g2', title: 'Learn the Basics', description: 'Watch an educational video', xpReward: 20, completed: false });
    } else {
      weeklyGoals.push({ id: 'g3', title: 'Zero Waste Day', description: 'Go a full day without single-use plastics', xpReward: 100, completed: false });
      weeklyGoals.push({ id: 'g4', title: 'Community Leader', description: 'Answer a question in the community', xpReward: 50, completed: false });
    }

    const { error: upsertError } = await supabase.from('user_journeys').upsert({
      user_id: userId,
      predicted_score: predictedScore,
      consistency_trend: consistencyTrend,
      streak_loss_probability: streakLossProbability,
      weekly_goals: weeklyGoals,
      updated_at: new Date().toISOString()
    });
    if (upsertError) {
      console.warn('[Journey] Failed to persist journey:', upsertError.message);
    }

    return {
      predictedScore,
      consistencyTrend,
      streakLossProbability,
      weeklyGoals,
      motivationMessage
    };
  } catch (error) {
    console.error('Error generating journey:', error);
    // Return sensible defaults if database fails
    return {
      predictedScore: 100,
      consistencyTrend: 'Stable',
      streakLossProbability: 50,
      weeklyGoals: [
        { id: 'def1', title: 'Daily Login', description: 'Log in to EcoPlay', xpReward: 5, completed: false }
      ],
      motivationMessage: "Welcome to your Eco Journey! Let's get started."
    };
  }
}

export async function fetchUserTimeline(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_timeline', { p_user_id: userId, p_limit: 20 });
    
    if (error) {
      const fallback = await supabase
        .from('xp_ledger')
        .select('id, activity_type, xp_awarded:final_xp, metadata, timestamp:awarded_at')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })
        .limit(20);
      return fallback.data || [];
    }
    return data || [];
  } catch (err) {
    console.error('Failed to fetch timeline:', err);
    return [];
  }
}

export async function fetchUserMilestones(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch milestones:', err);
    return [];
  }
}

export async function fetchGlobalRanking() {
  try {
    const { data, error } = await supabase
      .from('global_sustainability_ranking')
      .select('*')
      .limit(10);
      
    if (error) {
      // Fallback if view not found
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Failed to fetch global ranking:', err);
    return [];
  }
}
