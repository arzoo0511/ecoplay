import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import {
  TbBolt,
  TbDroplet,
  TbTree,
  TbAward,
  TbTarget,
  TbTrendingUp,
  TbFish,
  TbLeaf,
  TbSun,
  TbArrowUp,
  TbArrowDown,
  TbPlayerPlay
} from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../hooks/useGamification';

// ─── XP Panel Component ───────────────────────────────────────

const XPPanel: React.FC<{ authUser: any }> = ({ authUser }) => {
  const { stats, streak, badges, leaderboard, userRank, loading } = useGamification(authUser?.id ?? null);

  const streakEmoji = (s: number) =>
    s >= 30 ? '💎' : s >= 14 ? '⚡' : s >= 7 ? '🔥' : s >= 3 ? '✨' : '🌱';

  const multiplierColor = (m: number) =>
    m >= 3 ? 'text-yellow-300' : m >= 2 ? 'text-orange-300' : m >= 1.5 ? 'text-green-300' : 'text-white';

  if (loading) return (
    <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-white text-center">
      Loading XP data...
    </div>
  );

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* XP + Level */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">⚡ XP & Level</h2>
        {stats ? (
          <>
            <div className="text-5xl font-black text-green-400 mb-1">Lv.{stats.currentLevel}</div>
            <div className="text-white/70 text-sm mb-4">{stats.totalXP.toLocaleString()} total XP</div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, 100 - (stats.xpToNextLevel / (stats.xpToNextLevel + 100)) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/50">{stats.xpToNextLevel} XP to next level</p>
            {userRank && (
              <p className="mt-3 text-sm text-yellow-300 font-semibold">🏅 Global Rank #{userRank}</p>
            )}
          </>
        ) : (
          <p className="text-white/50 text-sm">Play to earn your first XP!</p>
        )}
      </div>

      {/* Streak */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">
          {streakEmoji(streak?.currentStreak ?? 0)} Daily Streak
        </h2>
        <div className="text-5xl font-black text-orange-400 mb-1">{streak?.currentStreak ?? 0}</div>
        <p className="text-white/70 text-sm mb-3">day streak</p>
        <p className="text-white/50 text-xs mb-4">Best: {streak?.longestStreak ?? 0} days</p>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-white/50 mb-1">Current Multiplier</p>
          <p className={`text-2xl font-black ${multiplierColor(streak?.streakMultiplier ?? 1)}`}>
            ×{streak?.streakMultiplier?.toFixed(1) ?? '1.0'}
          </p>
          <p className="text-xs text-white/40 mt-1">applied to all XP earned</p>
        </div>
      </div>

      {/* Leaderboard + Badges */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">🏆 Leaderboard</h2>
        {leaderboard && leaderboard.entries.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.entries.slice(0, 5).map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  entry.userId === authUser?.id
                    ? 'bg-green-500/20 border border-green-400/40'
                    : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-yellow-300 w-6">#{entry.rank}</span>
                  <span className="text-sm text-white truncate max-w-[80px]">{entry.username}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-400">{entry.totalXP.toLocaleString()} XP</p>
                  <p className="text-xs text-white/40">Lv.{entry.currentLevel}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-sm">No rankings yet — be the first!</p>
        )}
        {badges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-2">Your Badges</p>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((b: any) => (
                <span key={b.badge_key} title={b.badges?.name} className="text-xl cursor-default">
                  {b.badges?.icon}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────

const Dashboard = () => {
  const { state, dispatch } = useGame();
  const { user, ecoVillage, dailyChallenges, gameStats } = state;
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [challenges, setChallenges] = React.useState(dailyChallenges);
  React.useEffect(() => setChallenges(dailyChallenges), [dailyChallenges]);

  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let startTime: number;
      let animationFrame: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);
    return count;
  };

  const totalPoints = user.points;
  const animatedPoints = useCounter(totalPoints);

  const calculateEcoScore = () => {
    const villageScore = (ecoVillage.airQuality + ecoVillage.waterQuality + ecoVillage.biodiversity) / 3;
    const activityScore = Math.min(100, (gameStats.totalTrashCollected / 10) + (ecoVillage.trees / 2));
    const completionScore = (challenges.filter(c => c.completed).length / challenges.length) * 100;
    return Math.round((villageScore * 0.4) + (activityScore * 0.3) + (completionScore * 0.3));
  };

  const ecoScore = calculateEcoScore();
  const animatedEcoScore = useCounter(ecoScore);

  const pointsChange = Math.floor(totalPoints * 0.12);
  const ecoScoreChange = Math.floor((ecoScore - 65) / 5);

  const routeFor = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('cleanup') || t.includes('ocean')) return '/OceanCleanupGame';
    if (t.includes('water') || t.includes('tree') || t.includes('eco')) return '/EcoVillage';
    if (t.includes('learn') || t.includes('course') || t.includes('video')) return '/Learn';
    if (t.includes('event')) return '/Events';
    if (t.includes('community')) return '/Community';
    return '/EcoVillage';
  };

  const startChallenge = (title: string) => navigate(routeFor(title));

  const addProgress = (id: string, delta = 20) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id !== id || c.completed) return c;
        const next = Math.min(100, (c.progress ?? 0) + delta);
        const justCompleted = next >= 100;
        if (justCompleted) dispatch?.({ type: 'ADD_POINTS', payload: c.points });
        return { ...c, progress: next, completed: justCompleted };
      })
    );
  };

  const stats = [
    {
      icon: TbBolt,
      label: 'Total Points',
      value: animatedPoints.toLocaleString(),
      change: pointsChange,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      to: '/eco-village'
    },
    {
      icon: TbTree,
      label: 'Eco Score',
      value: `${animatedEcoScore}%`,
      change: ecoScoreChange,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      to: '/learn',
      subtitle: ecoScore >= 80 ? 'Excellent!' : ecoScore >= 60 ? 'Good Progress' : 'Keep Going!'
    },
    {
      icon: TbDroplet,
      label: 'Water Quality',
      value: `${ecoVillage.waterQuality}%`,
      change: Math.floor((ecoVillage.waterQuality - 70) / 3),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      to: '/eco-village'
    },
    {
      icon: TbFish,
      label: 'Ocean Cleanups',
      value: gameStats.perfectCleanups.toString(),
      change: gameStats.perfectCleanups > 0 ? 1 : 0,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      to: '/ocean-cleanup',
      subtitle: `${gameStats.totalTrashCollected} items collected`
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-10 relative z-10"
    >
      {/* Welcome */}
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
          Welcome back, <span className="text-green-400">{authUser?.name || 'Player'}!</span>
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Your environmental impact grows stronger every day. Continue your mission to save our planet!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const isNegative = stat.change < 0;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(stat.to)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(stat.to)}
              role="button"
              tabIndex={0}
              className="cursor-pointer bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/40 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4 relative z-10 border`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</h3>
                {stat.change !== 0 && (
                  <div className={`flex items-center text-sm mb-2 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
                    {isPositive && <TbArrowUp className="h-3 w-3 mr-1" />}
                    {isNegative && <TbArrowDown className="h-3 w-3 mr-1" />}
                    <span className="font-semibold">{isPositive && '+'}{Math.abs(stat.change)}</span>
                    <span className="ml-1 text-xs opacity-70">today</span>
                  </div>
                )}
                <p className="text-blue-100 font-medium">{stat.label}</p>
                {stat.subtitle && <p className="text-xs text-blue-300 mt-1 opacity-80">{stat.subtitle}</p>}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environment Status */}
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TbLeaf className="h-6 w-6 text-green-400 mr-2" />
            Environment Health
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Air Quality',   value: ecoVillage.airQuality,   color: 'bg-green-400',  trend: 2 },
              { label: 'Water Quality', value: ecoVillage.waterQuality, color: 'bg-blue-400',   trend: 3 },
              { label: 'Biodiversity',  value: ecoVillage.biodiversity, color: 'bg-purple-400', trend: 1 },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-white">
                  <span className="flex items-center">
                    {metric.label}
                    {metric.trend > 0 && (
                      <span className="ml-2 text-xs text-green-400 flex items-center">
                        <TbArrowUp className="h-3 w-3 mr-1" />+{metric.trend}%
                      </span>
                    )}
                  </span>
                  <span className="font-bold">{metric.value}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-full ${metric.color} rounded-full relative`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30 rounded-full"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="text-white bg-white/5 rounded-xl p-3">
              <TbTree className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="font-bold text-xl">{ecoVillage.trees}</p>
              <p className="text-sm text-blue-100">Trees Planted</p>
              <p className="text-xs text-green-400 mt-1">+{Math.floor(ecoVillage.trees * 0.15)} this week</p>
            </div>
            <div className="text-white bg-white/5 rounded-xl p-3">
              <TbSun className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-bold text-xl">{ecoVillage.solarPanels}</p>
              <p className="text-sm text-blue-100">Solar Panels</p>
              <p className="text-xs text-yellow-400 mt-1">{(ecoVillage.solarPanels * 0.25).toFixed(1)}kW</p>
            </div>
            <div className="text-white bg-white/5 rounded-xl p-3">
              <TbDroplet className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="font-bold text-xl">{ecoVillage.waterFilters}</p>
              <p className="text-sm text-blue-100">Water Filters</p>
              <p className="text-xs text-blue-400 mt-1">{(ecoVillage.waterFilters * 1000).toLocaleString()}L/day</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Challenges */}
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TbTarget className="h-6 w-6 text-orange-400 mr-2" />
            Daily Challenges
            <span className="ml-auto text-sm text-blue-200">
              {challenges.filter(c => c.completed).length}/{challenges.length} complete
            </span>
          </h2>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  challenge.completed
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{challenge.title}</h3>
                  <div className="flex items-center text-yellow-400">
                    <TbAward className="h-4 w-4 mr-1" />
                    <span className="text-sm font-bold">{challenge.points}</span>
                  </div>
                </div>
                <p className="text-blue-100 text-sm mb-3">{challenge.description}</p>
                {challenge.completed ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-400 font-medium">
                      <TbAward className="h-4 w-4 mr-2" />Completed!
                    </div>
                    <button
                      onClick={() => startChallenge(challenge.title)}
                      className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm"
                    >
                      View Related
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                           initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress}%` }}
                          className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full relative"
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/30"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                        </motion.div>
                      </div>
                      <p className="text-xs text-blue-200">{challenge.progress}% Complete</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => startChallenge(challenge.title)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
                      >
                        <TbPlayerPlay className="h-4 w-4 inline mr-1" />
                        Start
                      </button>
                      <button
                        onClick={() => addProgress(challenge.id)}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                      >
                        + Progress
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/learn')}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
          >
            <TbTrendingUp className="h-5 w-5 inline mr-2" />
            View All Challenges
          </motion.button>
        </motion.div>
      </div>

      {/* XP / Streak / Leaderboard Panel */}
      <XPPanel authUser={authUser} />

      {/* Eco Fact */}
      <motion.div
        variants={itemVariants}
        className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">🌟 Eco Fact of the Day</h2>
        <p className="text-lg text-white/90">
          A single tree can absorb up to 48 pounds of CO₂ per year and produce enough oxygen for two people to breathe!
          Your {ecoVillage.trees} trees are absorbing approximately{' '}
          <span className="font-bold text-green-300">{(ecoVillage.trees * 48).toLocaleString()} pounds</span> of CO₂ annually! 🌳
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;