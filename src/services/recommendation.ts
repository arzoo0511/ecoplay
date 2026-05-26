import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { GameState } from '../context/GameContext';

export interface ChallengeTemplate {
  title: string;
  description: string;
  category: 'water' | 'energy' | 'waste' | 'biodiversity' | 'community';
  basePoints: number;
  baseGoal: number;
  unit: string;
}

export interface RecommendedChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  completed: boolean;
  category: 'water' | 'energy' | 'waste' | 'biodiversity' | 'community';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reason: string;
  goal: number;
  unit: string;
}

export const CHALLENGE_TEMPLATE_POOL: ChallengeTemplate[] = [
  // Biodiversity
  {
    title: 'Plant a Tree',
    description: 'Add trees to your village to purify the air and boost biodiversity.',
    category: 'biodiversity',
    basePoints: 50,
    baseGoal: 1,
    unit: 'tree',
  },
  {
    title: 'Wildlife Haven',
    description: 'Welcome new animal species to your eco village.',
    category: 'biodiversity',
    basePoints: 65,
    baseGoal: 1,
    unit: 'animal',
  },
  // Water
  {
    title: 'Pure Water',
    description: 'Install water filters in your village to reduce pollution.',
    category: 'water',
    basePoints: 45,
    baseGoal: 1,
    unit: 'filter',
  },
  {
    title: 'Conserve Water',
    description: 'Maintain water storage levels in your village above 85%.',
    category: 'water',
    basePoints: 40,
    baseGoal: 85,
    unit: '%',
  },
  {
    title: 'Filter Repair',
    description: 'Repair degrading water filters to restore filter health.',
    category: 'water',
    basePoints: 35,
    baseGoal: 1,
    unit: 'repair',
  },
  // Waste
  {
    title: 'Collect Ocean Trash',
    description: 'Clean up marine debris in the Ocean Cleanup game.',
    category: 'waste',
    basePoints: 40,
    baseGoal: 15,
    unit: 'items',
  },
  {
    title: 'Perfect Cleanup',
    description: 'Complete a clean round with zero missed trash items.',
    category: 'waste',
    basePoints: 75,
    baseGoal: 1,
    unit: 'cleanup',
  },
  // Energy
  {
    title: 'Solar Upgrade',
    description: 'Install solar panels to generate clean energy for your village.',
    category: 'energy',
    basePoints: 60,
    baseGoal: 1,
    unit: 'panel',
  },
  {
    title: 'Reduce Pollution',
    description: 'Keep the overall village pollution level below 25%.',
    category: 'energy',
    basePoints: 50,
    baseGoal: 25,
    unit: '%',
  },
  // Community
  {
    title: 'Learn Sustain',
    description: 'Watch an educational video in the Learn section.',
    category: 'community',
    basePoints: 30,
    baseGoal: 1,
    unit: 'video',
  },
  {
    title: 'Quiz Master',
    description: 'Successfully complete a sustainability quiz.',
    category: 'community',
    basePoints: 35,
    baseGoal: 1,
    unit: 'quiz',
  },
  {
    title: 'Eco Post',
    description: 'Post an eco-friendly tip on the community board.',
    category: 'community',
    basePoints: 25,
    baseGoal: 1,
    unit: 'post',
  },
];

// Initialize category preferences
export function initPreferences(): Record<string, number> {
  return {
    water: 1.0,
    energy: 1.0,
    waste: 1.0,
    biodiversity: 1.0,
    community: 1.0,
  };
}

// Update category preference upon completing a challenge
export function updatePreference(
  currentPrefs: Record<string, number> | undefined,
  category: string
): Record<string, number> {
  const prefs = currentPrefs ? { ...currentPrefs } : initPreferences();
  if (category in prefs) {
    prefs[category] = Math.min(2.5, prefs[category] + 0.2);
  }
  return prefs;
}

// Recommendation Engine Scoring and Generation
export function generateRecommendations(
  state: GameState,
  userLevel: number = 1,
  currentStreak: number = 0,
  preferences?: Record<string, number>
): RecommendedChallenge[] {
  const prefs = preferences || state.categoryPreferences || initPreferences();
  const village = state.ecoVillage || {
    airQuality: 70,
    waterQuality: 72,
    biodiversity: 68,
    pollutionLevel: 30,
    filterHealth: 100,
    trees: 0,
    solarPanels: 0,
  };

  const scoredTemplates = CHALLENGE_TEMPLATE_POOL.map((template) => {
    let score = 10; // Base score
    let reason = 'Recommended based on your level and interest.';

    // 1. Category preference weight
    const prefWeight = prefs[template.category] || 1.0;
    score *= prefWeight;

    // 2. EcoVillage Health-based scoring updates
    if (template.category === 'biodiversity') {
      if (village.airQuality < 60) {
        score *= 2.0;
        reason = 'Village Air Quality is low! Plant trees and foster nature to restore it.';
      } else if (village.trees < 3) {
        score *= 1.4;
        reason = 'Grow your forest. More trees will boost village biodiversity.';
      }
    }

    if (template.category === 'water') {
      if (village.waterQuality < 60) {
        score *= 2.0;
        reason = 'Water Quality is dropping! Add water filters to purify your village water.';
      } else if (village.filterHealth < 50) {
        score *= 2.2;
        reason = 'Water filters are wearing out! Perform filter repairs to keep them clean.';
      }
    }

    if (template.category === 'waste') {
      if (village.pollutionLevel > 40) {
        score *= 1.8;
        reason = 'Village pollution levels are rising! Collect ocean trash to clean up.';
      }
    }

    if (template.category === 'energy') {
      if (village.solarPanels < 2) {
        score *= 1.5;
        reason = 'Harness clean energy! Install more solar panels to power your village.';
      } else if (village.pollutionLevel > 35) {
        score *= 1.6;
        reason = 'Reduce pollution! Clean energy upgrades help cool the environment.';
      }
    }

    // 3. Streak Recovery / Engagement Boost missions
    if (currentStreak === 0 || currentStreak === 1) {
      if (template.category === 'community') {
        score *= 2.5;
        reason = '⚡ Streak Recovery Mission! Complete this easy community task to kickstart your daily streak with bonus points!';
      }
    }

    // 4. Difficulty Scaling based on User Level
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy';
    let scaledGoal = template.baseGoal;
    let scaledPoints = template.basePoints;

    if (userLevel >= 8) {
      difficulty = 'Hard';
      scaledPoints = Math.round(template.basePoints * 1.6);
      if (template.unit !== '%' && template.unit !== 'cleanup') {
        scaledGoal = Math.round(template.baseGoal * 2.5);
      }
    } else if (userLevel >= 4) {
      difficulty = 'Medium';
      scaledPoints = Math.round(template.basePoints * 1.3);
      if (template.unit !== '%' && template.unit !== 'cleanup') {
        scaledGoal = Math.round(template.baseGoal * 1.5);
      }
    }

    // Special cases for goals to ensure sanity
    if (template.title === 'Collect Ocean Trash') {
      scaledGoal = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 25 : 40;
    } else if (template.title === 'Conserve Water') {
      scaledGoal = difficulty === 'Easy' ? 80 : difficulty === 'Medium' ? 88 : 95;
    } else if (template.title === 'Reduce Pollution') {
      scaledGoal = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 20 : 12;
    }

    // Add extra bonus for high-streak recovery community missions
    if ((currentStreak === 0 || currentStreak === 1) && template.category === 'community') {
      scaledPoints = Math.round(scaledPoints * 1.5);
    }

    return {
      template,
      score,
      reason,
      difficulty,
      goal: scaledGoal,
      points: scaledPoints,
    };
  });

  // Sort by score descending and take top 3
  const sorted = scoredTemplates.sort((a, b) => b.score - a.score);
  
  // Return the top 3 formatted recommendations
  return sorted.slice(0, 3).map((item) => ({
    id: `rec_${uuidv4()}`,
    title: item.template.title,
    description: item.template.description,
    points: item.points,
    progress: 0,
    completed: false,
    category: item.template.category,
    difficulty: item.difficulty,
    reason: item.reason,
    goal: item.goal,
    unit: item.template.unit,
  }));
}

// Sync recommendations with Supabase
export async function syncPreferencesToSupabase(
  userId: string,
  preferences: Record<string, number>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_eco_preferences').upsert({
      user_id: userId,
      water_preference: preferences.water || 1.0,
      energy_preference: preferences.energy || 1.0,
      waste_preference: preferences.waste || 1.0,
      biodiversity_preference: preferences.biodiversity || 1.0,
      community_preference: preferences.community || 1.0,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Supabase Sync] Error upserting preferences:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Supabase Sync] Failed to sync preferences:', e);
    return false;
  }
}

export async function fetchPreferencesFromSupabase(
  userId: string
): Promise<Record<string, number> | null> {
  try {
    const { data, error } = await supabase
      .from('user_eco_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[Supabase Sync] Error fetching preferences:', error);
      }
      return null;
    }

    return {
      water: Number(data.water_preference),
      energy: Number(data.energy_preference),
      waste: Number(data.waste_preference),
      biodiversity: Number(data.biodiversity_preference),
      community: Number(data.community_preference),
    };
  } catch (e) {
    console.error('[Supabase Sync] Failed to fetch preferences:', e);
    return null;
  }
}

// Save recommended challenge details to database
export async function saveRecommendedChallengeToDB(
  userId: string,
  challenge: RecommendedChallenge
): Promise<boolean> {
  try {
    const { error } = await supabase.from('challenges').insert({
      user_id: userId,
      title: challenge.title,
      description: challenge.description,
      points: challenge.points,
      progress: challenge.progress,
      completed: challenge.completed,
      is_recommended: true,
      category: challenge.category,
      difficulty: challenge.difficulty,
      recommendation_reason: challenge.reason,
    });

    if (error) {
      // Fallback: If custom fields don't exist yet, insert using standard fields
      console.warn('[Supabase Sync] Custom fields may not exist in challenges table. Retrying with basic fields...', error);
      const { error: fallbackError } = await supabase.from('challenges').insert({
        user_id: userId,
        title: challenge.title,
        description: `${challenge.description} (Recommended: ${challenge.reason})`,
        points: challenge.points,
        progress: challenge.progress,
        completed: challenge.completed,
      });

      if (fallbackError) {
        console.error('[Supabase Sync] Fallback challenge insert failed:', fallbackError);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error('[Supabase Sync] Failed to save challenge:', e);
    return false;
  }
}
