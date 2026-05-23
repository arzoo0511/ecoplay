import React from 'react';
import { useAuth } from './AuthContext';
import { loadState, saveState } from '../services/persistence';
import { awardXP } from '../lib/gamification';

// Define your GameState shape (example – adapt to your existing state)
export interface GameState {
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
  gameStats: {
    totalTrashCollected: number;
    perfectCleanups: number;
  };
  notifications: string[];
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
  dailyChallenges: [
    {
      id: 'c1',
      title: 'Plant a Tree',
      description: 'Add a tree to your eco village.',
      points: 50,
      progress: 0,
      completed: false
    },
    {
      id: 'c2',
      title: 'Collect Ocean Trash',
      description: 'Play a cleanup round.',
      points: 40,
      progress: 0,
      completed: false
    }
  ],
  gameStats: {
    totalTrashCollected: 0,
    perfectCleanups: 0
  },
  notifications: []
};

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<any>;
};

export const GameContext = React.createContext<GameContextValue | undefined>(undefined);

// Simulation constants
const RAIN_INTERVAL_MS = 15 * 60 * 1000;
const WATER_PER_RAIN = 20;
const WATER_CONSUMED_PER_TREE_PER_HOUR = 2;
const POLLUTION_PER_ANIMAL_PER_HOUR = 1.5;
const FILTER_DEGRADATION_PER_HOUR = 3;

function simulateTimePassed(state: GameState): { updates: Partial<GameState['ecoVillage']>; events: string[] } {
  const now = Date.now();
  const lastUpdated = state.ecoVillage.lastUpdated || now;
  const elapsed = now - lastUpdated;
  const hoursElapsed = elapsed / (1000 * 60 * 60);

  const events: string[] = [];
  const updates: Partial<GameState['ecoVillage']> = { lastUpdated: now };

  const rainCycles = Math.floor(elapsed / RAIN_INTERVAL_MS);
  if (rainCycles > 0) {
    const waterAdded = rainCycles * WATER_PER_RAIN;
    updates.waterStorage = Math.min(200, (state.ecoVillage.waterStorage || 0) + waterAdded);
    events.push(`🌧️ It rained ${rainCycles} time(s), adding ${waterAdded} water.`);
  }

  const treesCount = state.ecoVillage.trees || 0;
  if (treesCount > 0) {
    const waterConsumed = Math.floor(treesCount * WATER_CONSUMED_PER_TREE_PER_HOUR * hoursElapsed);
    updates.waterStorage = Math.max(0, (updates.waterStorage ?? state.ecoVillage.waterStorage) - waterConsumed);
    if (waterConsumed > 0) events.push(`🌳 ${treesCount} tree(s) consumed ${waterConsumed} water.`);
  }

  const animalCount = state.ecoVillage.wildlife?.length || 0;
  if (animalCount > 0) {
    const pollutionAdded = Math.floor(animalCount * POLLUTION_PER_ANIMAL_PER_HOUR * hoursElapsed);
    updates.waterQuality = Math.max(0, (state.ecoVillage.waterQuality || 0) - pollutionAdded);
    if (pollutionAdded > 0) events.push(`🐾 ${animalCount} animal(s) reduced water quality by ${pollutionAdded}%.`);
  }

  const filterCount = state.ecoVillage.waterFilters || 0;
  if (filterCount > 0) {
    const degradation = Math.floor(FILTER_DEGRADATION_PER_HOUR * hoursElapsed);
    updates.filterHealth = Math.max(0, (state.ecoVillage.filterHealth || 100) - degradation);
    if (degradation > 0) {
      events.push(`🔧 Water filters degraded by ${degradation}%. Health: ${updates.filterHealth}%`);
      if ((updates.filterHealth ?? 0) < 30) {
        events.push(`⚠️ Filters are worn out! Replace them soon.`);
      }
    }
  }

  if ((updates.waterStorage ?? state.ecoVillage.waterStorage) < 20) {
    events.push(`💧 Water storage is critically low!`);
  }

  return { updates, events };
}

function reducer(state: GameState, action: any): GameState {
  switch (action.type) {
    case 'ADD_POINTS':
      return { ...state, user: { ...state.user, points: state.user.points + action.payload } };
    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        dailyChallenges: state.dailyChallenges.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        )
      };
    case 'UPDATE_ECO_VILLAGE':
      return {
        ...state,
        ecoVillage: { ...state.ecoVillage, ...action.payload, lastUpdated: Date.now() }
      };
    case 'SIMULATE_TIME':
      const { updates, events } = simulateTimePassed(state);
      return {
        ...state,
        ecoVillage: { ...state.ecoVillage, ...updates },
        notifications: events
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'UPDATE_OCEAN_STATS':
      return {
        ...state,
        gameStats: {
          ...state.gameStats,
          totalTrashCollected: action.payload.totalTrashCollected ?? state.gameStats.totalTrashCollected,
          perfectCleanups: action.payload.perfectCleanups ?? state.gameStats.perfectCleanups,
        }
      };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatchBase] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    if (!user) return;
    const loaded = loadState(user.id);
    if (loaded) {
      dispatchBase({ type: 'HYDRATE', payload: loaded });
      setTimeout(() => dispatchBase({ type: 'SIMULATE_TIME' }), 100);
    } else {
      dispatchBase({ type: 'HYDRATE', payload: { ...initialState, user: { ...initialState.user, name: user.name } } });
    }
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => saveState({ userId: user.id, state }), 300);
    return () => clearTimeout(t);
  }, [state, user]);

  // Award login bonus XP once per session
  React.useEffect(() => {
    if (!user?.id) return;
    awardXP(user.id, 'login_bonus').catch((e) => console.error('[XP] login bonus failed:', e));
  }, [user?.id]);

  const dispatch = React.useCallback((action: any) => {
    dispatchBase(action);

    if (action.type === 'ADD_POINTS') {
      if (!user?.id) {
        console.warn('[XP] No user ID — skipping XP award');
        return;
      }
      const activity = action.activityType ?? 'daily_challenge';
      console.log('[XP] Awarding XP for', activity, 'user:', user.id);
      awardXP(user.id, activity, action.metadata)
        .then((result) => console.log('[XP] Award result:', result))
        .catch((e) => console.error('[XP] Award failed:', e));
    }
  }, [user?.id]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
