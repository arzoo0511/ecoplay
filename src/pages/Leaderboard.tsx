import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Star, Users, ArrowUp, ArrowDown, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

type TimeFrame = 'weekly' | 'allTime';
type SortMetric = 'points' | 'challenges' | 'badges' | 'contributions';

interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  points: number;
  challenges: number;
  badges: number;
  contributions: number;
  trend: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const MOCK_USERS_ALL_TIME: LeaderboardUser[] = [
  { id: '1', name: 'EcoWarrior', avatarUrl: null, points: 15400, challenges: 142, badges: 24, contributions: 89, trend: 'up' },
  { id: '2', name: 'GreenLife', avatarUrl: null, points: 14200, challenges: 130, badges: 20, contributions: 75, trend: 'same' },
  { id: '3', name: 'NatureLover', avatarUrl: null, points: 12800, challenges: 115, badges: 18, contributions: 92, trend: 'up' },
  { id: '4', name: 'EarthSaver', avatarUrl: null, points: 11500, challenges: 98, badges: 15, contributions: 45, trend: 'down' },
  { id: '5', name: 'CaptainPlanet', avatarUrl: null, points: 10200, challenges: 85, badges: 12, contributions: 60, trend: 'up' },
  { id: '6', name: 'TreeHugger', avatarUrl: null, points: 9800, challenges: 80, badges: 10, contributions: 30, trend: 'same' },
  { id: '7', name: 'OceanDefender', avatarUrl: null, points: 8900, challenges: 75, badges: 9, contributions: 42, trend: 'down' },
  { id: '8', name: 'SustainableSam', avatarUrl: null, points: 8500, challenges: 70, badges: 8, contributions: 25, trend: 'up' },
];

const MOCK_USERS_WEEKLY: LeaderboardUser[] = [
  { id: '3', name: 'NatureLover', avatarUrl: null, points: 1200, challenges: 15, badges: 3, contributions: 12, trend: 'up' },
  { id: '1', name: 'EcoWarrior', avatarUrl: null, points: 1150, challenges: 12, badges: 2, contributions: 8, trend: 'down' },
  { id: '5', name: 'CaptainPlanet', avatarUrl: null, points: 980, challenges: 10, badges: 2, contributions: 5, trend: 'up' },
  { id: '8', name: 'SustainableSam', avatarUrl: null, points: 850, challenges: 9, badges: 1, contributions: 3, trend: 'up' },
  { id: '2', name: 'GreenLife', avatarUrl: null, points: 720, challenges: 7, badges: 1, contributions: 6, trend: 'down' },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const { state } = useGame();
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  const [sortMetric, setSortMetric] = useState<SortMetric>('points');

  const currentUserEntry: LeaderboardUser | null = user ? {
    id: user.id,
    name: user.name || 'You',
    avatarUrl: user.avatarUrl || null,
    points: state.user.points || 0,
    challenges: state.gameStats?.totalTrashCollected || 0,
    badges: 5, // Mock data
    contributions: 10, // Mock data
    trend: 'up',
    isCurrentUser: true
  } : null;

  const sortedUsers = useMemo(() => {
    let baseUsers = timeFrame === 'weekly' ? [...MOCK_USERS_WEEKLY] : [...MOCK_USERS_ALL_TIME];
    
    if (currentUserEntry && !baseUsers.some(u => u.id === currentUserEntry.id)) {
      baseUsers.push(currentUserEntry);
    }

    return baseUsers.sort((a, b) => b[sortMetric] - a[sortMetric]);
  }, [timeFrame, sortMetric, currentUserEntry]);

  const metrics: { id: SortMetric; label: string; icon: React.ReactNode }[] = [
    { id: 'points', label: 'Eco Points', icon: <Star className="w-4 h-4" /> },
    { id: 'challenges', label: 'Challenges', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'badges', label: 'Badges', icon: <Award className="w-4 h-4" /> },
    { id: 'contributions', label: 'Contributions', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 rounded-full mb-2 border border-emerald-500/30">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            Global Leaderboard
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            See how you stack up against other eco-warriors. Earn points, complete challenges, and contribute to the community to climb the ranks.
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
          
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setTimeFrame('weekly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                timeFrame === 'weekly' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFrame('allTime')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                timeFrame === 'allTime' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Time
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSortMetric(metric.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                  sortMetric === metric.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                {metric.icon}
                <span className="text-sm font-medium">{metric.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold text-center w-24">Rank</th>
                  <th className="p-4 font-semibold">Player</th>
                  <th className="p-4 font-semibold text-right">Points</th>
                  <th className="p-4 font-semibold text-center">Challenges</th>
                  <th className="p-4 font-semibold text-center hidden sm:table-cell">Badges</th>
                  <th className="p-4 font-semibold text-center hidden md:table-cell">Community</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sortedUsers.map((u, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr 
                      key={u.id}
                      className={`group transition-colors duration-200 ${
                        u.isCurrentUser 
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500' 
                        : 'hover:bg-slate-700/30 border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          {rank === 1 ? <Medal className="w-7 h-7 text-yellow-400 drop-shadow-md" /> :
                           rank === 2 ? <Medal className="w-7 h-7 text-slate-300 drop-shadow-md" /> :
                           rank === 3 ? <Medal className="w-7 h-7 text-amber-600 drop-shadow-md" /> :
                           <span className="text-slate-500 font-bold text-lg">{rank}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${
                            isTop3 ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 'bg-slate-700'
                          }`}>
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className={`font-semibold ${u.isCurrentUser ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {u.name} {u.isCurrentUser && '(You)'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              {u.trend === 'up' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> :
                               u.trend === 'down' ? <ArrowDown className="w-3 h-3 text-red-500" /> :
                               <span className="w-3 h-3 block text-center">-</span>}
                              Rank trend
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-emerald-400 text-lg">
                            {u.points.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 uppercase tracking-wider">XP</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-slate-300 font-medium">
                          {u.challenges}
                        </div>
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-amber-400 font-medium">
                          {u.badges}
                        </div>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-blue-400 font-medium">
                          {u.contributions}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
