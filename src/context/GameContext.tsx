import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
  ecoScore: number;
  badges: string[];
}

interface EcoVillageState {
  airQuality: number;
  waterQuality: number;
  biodiversity: number;
  trees: number;
  solarPanels: number;
  waterFilters: number;
  wildlife: string[];
  pollutionLevel: number;
}

interface GameState {
  user: User;
  ecoVillage: EcoVillageState;
  dailyChallenges: Challenge[];
  leaderboard: User[];
  gameStats: {
    oceanCleanupScore: number;
    totalTrashCollected: number;
    perfectCleanups: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'ocean-cleanup' | 'quiz' | 'eco-action';
  completed: boolean;
  progress: number;
}

const initialState: GameState = {
  user: {
    id: '1',
    name: 'EcoWarrior',
    points: 1250,
    level: 5,
    ecoScore: 78,
    badges: ['First Cleanup', 'Tree Planter', 'Ocean Guardian']
  },
  ecoVillage: {
    airQuality: 65,
    waterQuality: 70,
    biodiversity: 45,
    trees: 15,
    solarPanels: 3,
    waterFilters: 2,
    wildlife: ['fish', 'birds', 'butterflies'],
    pollutionLevel: 35
  },
  dailyChallenges: [
    {
      id: '1',
      title: 'Ocean Cleanup Sprint',
      description: 'Collect 50 pieces of trash in under 3 minutes',
      points: 100,
      type: 'ocean-cleanup',
      completed: false,
      progress: 0
    },
    {
      id: '2',
      title: 'Eco Knowledge Quiz',
      description: 'Answer 5 environmental questions correctly',
      points: 75,
      type: 'quiz',
      completed: true,
      progress: 100
    }
  ],
  leaderboard: [
    { id: '1', name: 'EcoWarrior', points: 1250, level: 5, ecoScore: 78, badges: [] },
    { id: '2', name: 'GreenHero', points: 1180, level: 4, ecoScore: 82, badges: [] },
    { id: '3', name: 'NatureLover', points: 1050, level: 4, ecoScore: 75, badges: [] }
  ],
  gameStats: {
    oceanCleanupScore: 850,
    totalTrashCollected: 234,
    perfectCleanups: 12
  }
};

type GameAction = 
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'COMPLETE_CHALLENGE'; payload: string }
  | { type: 'UPDATE_ECO_VILLAGE'; payload: Partial<EcoVillageState> }
  | { type: 'UPDATE_OCEAN_STATS'; payload: Partial<typeof initialState.gameStats> };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_POINTS':
      return {
        ...state,
        user: { ...state.user, points: state.user.points + action.payload }
      };
    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        dailyChallenges: state.dailyChallenges.map(challenge =>
          challenge.id === action.payload
            ? { ...challenge, completed: true, progress: 100 }
            : challenge
        )
      };
    case 'UPDATE_ECO_VILLAGE':
      return {
        ...state,
        ecoVillage: { ...state.ecoVillage, ...action.payload }
      };
    case 'UPDATE_OCEAN_STATS':
      return {
        ...state,
        gameStats: { ...state.gameStats, ...action.payload }
      };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};