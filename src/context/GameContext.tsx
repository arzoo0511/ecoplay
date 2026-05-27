import React from 'react';
import { create } from 'zustand';
import { useAuth } from './AuthContext';
import { loadState, saveState } from '../services/persistence';
import { awardXP } from '../lib/gamification';
import { initPreferences, RecommendedChallenge } from '../services/recommendation';
import { dbFunctions } from '../lib/supabase';


// Define your GameState shape
export interface GameState {
  userId?: string;
  user: { points: number; name: string };
  ecoVillage: {
    airQuality: number;
    waterQuality: number;
    biodiversity: number;
    trees: number;
    solarPanels: number;
    waterFilters: number;
    pollutionLevel: number;
    wildlife: string[];
    waterStorage: number;
    filterHealth: number;
    lastUpdated: number;
    inventory: string[];
    landscape: { emoji: string; x: number; y: number }[];
  };
  dailyChallenges: {
    id: string;
    title: string;
    description: string;
    points: number;
    progress: number;
    completed: boolean;
  }[];
  recommendedChallenges?: RecommendedChallenge[];
  categoryPreferences?: Record<string, number>;
  lastRecommendationsRefresh?: number;
  gameStats: {
    totalTrashCollected: number;
    perfectCleanups: number;
  };
  notifications: string[];
  lastChallengeRefresh: number;
  communityEvents?: {
    events: any[];
    participation: Record<string, number>;
    history: any[];
  };
}

const CHALLENGE_POOL = [
  { title: 'Plant a Tree', description: 'Add a tree to your eco village.', points: 50 },
  { title: 'Collect Ocean Trash', description: 'Play a cleanup round.', points: 40 },
  { title: 'Learn Sustain', description: 'Watch an educational video in the Learn section.', points: 30 },
  { title: 'Solar Upgrade', description: 'Install a solar panel in your village.', points: 60 },
  { title: 'Pure Water', description: 'Install a water filter in your village.', points: 45 },
  { title: 'Eco Post', description: 'Create a post in the community board.', points: 25 },
  { title: 'Quiz Whiz', description: 'Complete a sustainability quiz.', points: 35 },
];

function generateDailyChallenges(seedTime: number = Date.now()): GameState['dailyChallenges'] {
  const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((c, i) => ({
    id: `c_${seedTime}_${i}`,
    title: c.title,
    description: c.description,
    points: c.points,
    progress: 0,
    completed: false,
  }));
}

const initialState: GameState = {
  user: { points: 0, name: 'Player' },
  ecoVillage: {
    airQuality: 70,
    waterQuality: 72,
    biodiversity: 68,
    trees: 0,
    solarPanels: 0,
    waterFilters: 0,
    pollutionLevel: 30,
    wildlife: [],
    waterStorage: 100,
    filterHealth: 100,
    lastUpdated: Date.now(),
    inventory: [],
    landscape: []
  },
  dailyChallenges: [],
  recommendedChallenges: [],
  categoryPreferences: initPreferences(),
  lastRecommendationsRefresh: 0,
  gameStats: {
    totalTrashCollected: 0,
    perfectCleanups: 0
  },
  notifications: [],
  lastChallengeRefresh: 0,
  communityEvents: {
    events: [],
    participation: {},
    history: [],
  }
};

type GameStore = GameState & {
  dispatch: (action: any) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  dispatch: async (action: any) => {
    // Handle XP actions safely
    if (action.type === 'ADD_POINTS') {
      const state = get();
      if (!state.userId) {
        console.warn('[XP] No user ID — skipping XP award');
        return;
      }
      const activity = action.activityType ?? 'daily_challenge';
      try {
        console.log('[XP] Awarding XP for', activity, 'user:', state.userId);
        const result = await awardXP(state.userId, activity, action.metadata);
        console.log('[XP] Award result:', result);
        set((prev) => reducer(prev, action));
      } catch (e) {
        console.error('[XP] Award failed:', e);
        return;
      }
      return;
    }
    // Normal actions
    set((prev) => reducer(prev, action));
  },
}));

// Simulation constants
const RAIN_INTERVAL_MS = 15 * 60 * 1000;
const WATER_PER_RAIN = 20;
const WATER_CONSUMED_PER_TREE_PER_HOUR = 2;
const POLLUTION_PER_ANIMAL_PER_HOUR = 1.5;
const FILTER_DEGRADATION_PER_HOUR = 3;

function simulateTimePassed(
  state: GameState
): {
  updates: Partial<GameState['ecoVillage']>;
  events: string[];
} {
  const now = Date.now();
  const lastUpdated = state.ecoVillage.lastUpdated || now;
  const elapsed = now - lastUpdated;
  const hoursElapsed = elapsed / (1000 * 60 * 60);

  const events: string[] = [];
  const updates: Partial<GameState['ecoVillage']> = {
    lastUpdated: now
  };

  const rainCycles = Math.floor(elapsed / RAIN_INTERVAL_MS);

  if (rainCycles > 0) {
    const waterAdded = rainCycles * WATER_PER_RAIN;

    updates.waterStorage = Math.min(
      200,
      (state.ecoVillage.waterStorage || 0) + waterAdded
    );

    events.push(
      `🌧️ It rained ${rainCycles} time(s), adding ${waterAdded} water.`
    );
  }

  const treesCount = state.ecoVillage.trees || 0;

  if (treesCount > 0) {
    const waterConsumed = Math.floor(
      treesCount *
        WATER_CONSUMED_PER_TREE_PER_HOUR *
        hoursElapsed
    );

    updates.waterStorage = Math.max(
      0,
      (updates.waterStorage ??
        state.ecoVillage.waterStorage) - waterConsumed
    );

    if (waterConsumed > 0) {
      events.push(
        `🌳 ${treesCount} tree(s) consumed ${waterConsumed} water.`
      );
    }
  }

  const animalCount =
    state.ecoVillage.wildlife?.length || 0;

  if (animalCount > 0) {
    const pollutionAdded = Math.floor(
      animalCount *
        POLLUTION_PER_ANIMAL_PER_HOUR *
        hoursElapsed
    );

    updates.waterQuality = Math.max(
      0,
      (state.ecoVillage.waterQuality || 0) -
        pollutionAdded
    );

    if (pollutionAdded > 0) {
      events.push(
        `🐾 ${animalCount} animal(s) reduced water quality by ${pollutionAdded}%.`
      );
    }
  }

  const filterCount =
    state.ecoVillage.waterFilters || 0;

  if (filterCount > 0) {
    const degradation = Math.floor(
      FILTER_DEGRADATION_PER_HOUR *
        hoursElapsed
    );

    updates.filterHealth = Math.max(
      0,
      (state.ecoVillage.filterHealth || 100) -
        degradation
    );

    if (degradation > 0) {
      events.push(
        `🔧 Water filters degraded by ${degradation}%. Health: ${updates.filterHealth}%`
      );

      if ((updates.filterHealth ?? 0) < 30) {
        events.push(
          `⚠️ Filters are worn out! Replace them soon.`
        );
      }
    }
  }

  if (
    (updates.waterStorage ??
      state.ecoVillage.waterStorage) < 20
  ) {
    events.push(`💧 Water storage is critically low!`);
  }

  return { updates, events };
}

function reducer(
  state: GameState,
  action: any
): GameState {
  switch (action.type) {
    case 'ADD_POINTS':
      return {
        ...state,
        user: {
          ...state.user,
          points:
            state.user.points + action.payload
        }
      };

    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        dailyChallenges:
          state.dailyChallenges.map((c) =>
            c.id === action.payload.id
              ? {
                  ...c,
                  ...action.payload.data
                }
              : c
          )
      };
    case 'REFRESH_CHALLENGES':
      return {
        ...state,
        dailyChallenges: action.payload.challenges,
        lastChallengeRefresh: action.payload.lastChallengeRefresh
      };
    case 'UPDATE_RECOMMENDED_CHALLENGE':
      return {
        ...state,
        recommendedChallenges: (state.recommendedChallenges || []).map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        )
      };
    case 'REFRESH_RECOMMENDATIONS':
      return {
        ...state,
        recommendedChallenges: action.payload.challenges,
        lastRecommendationsRefresh: action.payload.lastRecommendationsRefresh
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        categoryPreferences: action.payload
      };
    case 'UPDATE_ECO_VILLAGE':
      return {
        ...state,
        ecoVillage: {
          ...state.ecoVillage,
          ...action.payload,
          lastUpdated: Date.now()
        }
      };

    case 'SIMULATE_TIME':
      const { updates, events } =
        simulateTimePassed(state);

      return {
        ...state,
        ecoVillage: {
          ...state.ecoVillage,
          ...updates
        },
        notifications: events
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    case 'UPDATE_OCEAN_STATS':
      return {
        ...state,
        gameStats: {
          ...state.gameStats,
          totalTrashCollected:
            action.payload.totalTrashCollected ??
            state.gameStats.totalTrashCollected,
          perfectCleanups:
            action.payload.perfectCleanups ??
            state.gameStats.perfectCleanups
        }
      };

    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        categoryPreferences: action.payload.categoryPreferences || state.categoryPreferences || initPreferences(),
        recommendedChallenges: action.payload.recommendedChallenges || state.recommendedChallenges || []
      };
    case 'SET_COMMUNITY_EVENTS':
      return {
        ...state,
        communityEvents: {
          events: action.payload.events,
          participation: action.payload.participation,
          history: state.communityEvents?.history || [],
        },
      };
    case 'SET_COMMUNITY_HISTORY':
      return {
        ...state,
        communityEvents: {
          events: state.communityEvents?.events || [],
          participation: state.communityEvents?.participation || {},
          history: action.payload.history,
        },
      };
    case 'UPDATE_EVENT_CONTRIBUTION':
      const updatedParticipation = {
        ...(state.communityEvents?.participation || {}),
        [action.payload.eventId]: action.payload.contribution,
      };
      const updatedEvents = (state.communityEvents?.events || []).map((e) => {
        if (e.id === action.payload.eventId) {
          return {
            ...e,
            communityProgress: action.payload.communityProgress,
          };
        }
        return e;
      });
      return {
        ...state,
        communityEvents: {
          events: updatedEvents,
          participation: updatedParticipation,
          history: state.communityEvents?.history || [],
        },
      };
    default:
      return state;
  }
}

export const GameProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const dispatchBase = useGameStore((state) => state.dispatch);
  const gameState = useGameStore();

  React.useEffect(() => {
    useGameStore.setState({ userId: user?.id });
  }, [user?.id]);

  React.useEffect(() => {
    if (!user) return;

    const loaded = loadState(user.id);

    if (loaded) {
      let finalPayload = loaded;
      const now = Date.now();
      const lastRefresh = loaded.lastChallengeRefresh || 0;
      if (now - lastRefresh >= 24 * 60 * 60 * 1000) {
        finalPayload = {
          ...loaded,
          dailyChallenges: generateDailyChallenges(now),
          lastChallengeRefresh: now
        };
      }
      dispatchBase({ type: 'HYDRATE', payload: finalPayload });
      setTimeout(() => dispatchBase({ type: 'SIMULATE_TIME' }), 100);
    } else {
      const now = Date.now();
      dispatchBase({
        type: 'HYDRATE',
        payload: {
          ...initialState,
          user: { ...initialState.user, name: user.name },
          dailyChallenges: generateDailyChallenges(now),
          lastChallengeRefresh: now
        }
      });
    }
  }, [user, dispatchBase]);

  const lastRefresh = useGameStore((state) => state.lastChallengeRefresh);
  React.useEffect(() => {
    if (!user || !lastRefresh) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRefresh >= 24 * 60 * 60 * 1000) {
        dispatchBase({
          type: 'REFRESH_CHALLENGES',
          payload: {
            challenges: generateDailyChallenges(now),
            lastChallengeRefresh: now
          }
        });
      }
    }, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [user, lastRefresh, dispatchBase]);

  React.useEffect(() => {
    if (!user) return;

    const t = setTimeout(() => {
      // Exclude functions when saving state
      const { dispatch, ...stateToSave } = gameState;
      saveState({
        userId: user.id,
        state: stateToSave as GameState
      });
    }, 300);

    return () => clearTimeout(t);
  }, [gameState, user]);

  React.useEffect(() => {
    if (!user) return;

    const fetchCommunityData = async () => {
      try {
        const { events, participation } = await dbFunctions.getCommunityEvents(user.id);
        dispatchBase({
          type: 'SET_COMMUNITY_EVENTS',
          payload: { events, participation },
        });

        const history = await dbFunctions.getEventHistory(user.id);
        dispatchBase({
          type: 'SET_COMMUNITY_HISTORY',
          payload: { history },
        });
      } catch (err) {
        console.error('Failed to sync community events from Supabase:', err);
      }
    };

    fetchCommunityData();
    const interval = setInterval(fetchCommunityData, 30000);
    return () => clearInterval(interval);
  }, [user, dispatchBase]);

  React.useEffect(() => {
    if (!user?.id) return;

    awardXP(user.id, 'login_bonus')
      .then((result) => {
        console.log('[XP] Login bonus awarded:', result);
      })
      .catch((e) => {
        console.error('[XP] Login bonus failed:', e);
      });
  }, [user?.id]);

  return <>{children}</>;
};