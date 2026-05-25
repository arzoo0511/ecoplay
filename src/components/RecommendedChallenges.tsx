import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../hooks/useGamification';
import {
  generateRecommendations,
  updatePreference,
  syncPreferencesToSupabase,
  saveRecommendedChallengeToDB,
  fetchPreferencesFromSupabase,
  RecommendedChallenge
} from '../services/recommendation';
import {
  TbDroplet,
  TbBolt,
  TbFish,
  TbTree,
  TbAward,
  TbPlayerPlay,
  TbRefresh,
  TbFlame,
  TbAlertTriangle
} from 'react-icons/tb';

export const RecommendedChallenges: React.FC = () => {
  const { state, dispatch } = useGame();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // Fetch live stats & streak from gamification hook
  const { stats, streak, loading: gamificationLoading } = useGamification(authUser?.id ?? null);
  const [syncing, setSyncing] = useState(false);

  const level = stats?.currentLevel ?? 1;
  const currentStreak = streak?.currentStreak ?? 0;

  // Hydrate preferences from Supabase if available
  useEffect(() => {
    if (!authUser?.id) return;
    
    const loadDBPreferences = async () => {
      const dbPrefs = await fetchPreferencesFromSupabase(authUser.id);
      if (dbPrefs) {
        dispatch?.({
          type: 'UPDATE_PREFERENCES',
          payload: dbPrefs
        });
      }
    };
    
    loadDBPreferences();
  }, [authUser?.id, dispatch]);

  // Generate recommendations if none exist yet
  useEffect(() => {
    if (
      state.recommendedChallenges && 
      state.recommendedChallenges.length === 0 && 
      !gamificationLoading
    ) {
      handleRefresh();
    }
  }, [state.recommendedChallenges?.length, gamificationLoading, level, currentStreak]);

  const handleRefresh = () => {
    setSyncing(true);
    try {
      const recommendations = generateRecommendations(
        state,
        level,
        currentStreak,
        state.categoryPreferences
      );

      dispatch?.({
        type: 'REFRESH_RECOMMENDATIONS',
        payload: {
          challenges: recommendations,
          lastRecommendationsRefresh: Date.now()
        }
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water':
        return <TbDroplet className="h-5 w-5 text-blue-400" />;
      case 'energy':
        return <TbBolt className="h-5 w-5 text-yellow-400" />;
      case 'waste':
        return <TbFish className="h-5 w-5 text-purple-400" />;
      case 'biodiversity':
        return <TbTree className="h-5 w-5 text-green-400" />;
      default:
        return <TbAward className="h-5 w-5 text-pink-400" />;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'water':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'energy':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'waste':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      case 'biodiversity':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      default:
        return 'bg-pink-500/10 border-pink-500/30 text-pink-300';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-white bg-white/10';
    }
  };

  const routeFor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('cleanup') || t.includes('ocean')) return '/ocean-cleanup-game';
    if (t.includes('water') || t.includes('tree') || t.includes('eco') || t.includes('solar') || t.includes('filter')) return '/eco-village';
    if (t.includes('learn') || t.includes('course') || t.includes('video')) return '/learn';
    if (t.includes('event')) return '/events';
    if (t.includes('community')) return '/community';
    return '/eco-village';
  };

  const startChallenge = (title: string) => navigate(routeFor(title));

  const addProgress = async (id: string, delta = 25) => {
    const challenge = state.recommendedChallenges?.find(c => c.id === id);
    if (!challenge || challenge.completed) return;

    const nextProgress = Math.min(100, (challenge.progress ?? 0) + delta);
    const justCompleted = nextProgress >= 100;

    // Update locally in context
    dispatch?.({
      type: 'UPDATE_RECOMMENDED_CHALLENGE',
      payload: {
        id,
        data: {
          progress: nextProgress,
          completed: justCompleted
        }
      }
    });

    // If completed, award points and update preferences
    if (justCompleted) {
      dispatch?.({
        type: 'ADD_POINTS',
        payload: challenge.points,
        activityType: 'daily_challenge'
      });

      // Update interest category preferences
      const updatedPrefs = updatePreference(state.categoryPreferences, challenge.category);
      dispatch?.({
        type: 'UPDATE_PREFERENCES',
        payload: updatedPrefs
      });

      // Sync metadata to Supabase
      if (authUser?.id) {
        await syncPreferencesToSupabase(authUser.id, updatedPrefs);
        await saveRecommendedChallengeToDB(authUser.id, {
          ...challenge,
          progress: 100,
          completed: true
        });
      }
    } else {
      // Save partial progress in Supabase if user is logged in
      if (authUser?.id) {
        await saveRecommendedChallengeToDB(authUser.id, {
          ...challenge,
          progress: nextProgress,
          completed: false
        });
      }
    }
  };

  const activeRecommendations = state.recommendedChallenges || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TbAward className="h-6 w-6 text-green-400" />
            Recommended For You
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            AI-powered suggestions based on your village status, interests, and activity.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={syncing}
          className={`p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 flex items-center justify-center ${
            syncing ? 'animate-spin opacity-50' : ''
          }`}
          title="Refresh Recommendations"
        >
          <TbRefresh className="h-5 w-5" />
        </button>
      </div>

      {/* Challenges List */}
      <div className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {activeRecommendations.length > 0 ? (
            activeRecommendations.map((challenge) => {
              const isStreakBooster = challenge.reason.includes('Streak Recovery');
              
              return (
                <motion.div
                  key={challenge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                    challenge.completed
                      ? 'bg-green-500/20 border-green-400/80 shadow-lg shadow-green-500/5'
                      : isStreakBooster
                      ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-400/60 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Streak Booster Sparkle Effect */}
                  {isStreakBooster && !challenge.completed && (
                    <div className="absolute right-0 top-0 bg-gradient-to-l from-orange-500 to-yellow-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                      <TbFlame className="h-3 w-3 animate-bounce" />
                      Booster
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    {/* Category Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${getCategoryStyles(challenge.category)}`}>
                      {getCategoryIcon(challenge.category)}
                      {challenge.category}
                    </div>

                    {/* Difficulty Badge */}
                    <div className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold tracking-wide uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </div>

                    {/* XP reward */}
                    <div className="ml-auto text-yellow-400 font-extrabold flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 text-xs">
                      <TbAward className="h-4 w-4" />
                      +{challenge.points} XP
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-blue-100 mb-3">{challenge.description}</p>

                  {/* Contextual Reason Alert */}
                  <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-xs ${
                    isStreakBooster 
                      ? 'bg-orange-500/10 text-orange-200 border border-orange-500/20' 
                      : 'bg-green-500/10 text-green-200 border border-green-500/20'
                  }`}>
                    {isStreakBooster ? (
                      <TbFlame className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <TbAlertTriangle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{challenge.reason}</span>
                  </div>

                  {/* Progress Indicator */}
                  {challenge.completed ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-400 font-bold text-sm">
                        <TbAward className="h-5 w-5 mr-1.5" />
                        Completed! Points Awarded
                      </div>
                      <button
                        onClick={() => startChallenge(challenge.title)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-semibold border border-white/10"
                      >
                        Explore Village
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-blue-200">
                          <span>Progress: {challenge.progress}%</span>
                          <span>Target: {challenge.goal} {challenge.unit}s</span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${challenge.progress}%` }}
                            className={`h-full rounded-full relative ${
                              isStreakBooster 
                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500' 
                                : 'bg-gradient-to-r from-green-400 to-emerald-500'
                            }`}
                          >
                            <motion.div
                              className="absolute inset-0 bg-white/20"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => startChallenge(challenge.title)}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md ${
                            isStreakBooster 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/20' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/20'
                          }`}
                        >
                          <TbPlayerPlay className="h-4 w-4" />
                          Start Mission
                        </button>
                        <button
                          onClick={() => addProgress(challenge.id)}
                          className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-bold border border-white/15"
                        >
                          + Progress
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-blue-200/60 text-sm">
              No recommendations available. Click refresh to query the intelligence engine.
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
