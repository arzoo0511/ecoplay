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
import { LEVEL_THRESHOLDS } from '../lib/gamification';
import { RecommendedChallenges } from '../components/RecommendedChallenges';
import { CommunityProgress } from '../components/CommunityProgress';


// ─── XP Panel Component ───────────────────────────────────────

const XPPanel: React.FC<{ authUser: any }> = ({ authUser }) => {
  const { stats, streak, badges, leaderboard, userRank } = useGamification(authUser?.id ?? null);

const loading =
  stats === null ||
  streak === null ||
  leaderboard === null;

  const streakEmoji = (s: number) =>
    s >= 30 ? '💎' : s >= 14 ? '⚡' : s >= 7 ? '🔥' : s >= 3 ? '✨' : '🌱';

  const multiplierColor = (m: number) =>
    m >= 3 ? 'text-yellow-300' : m >= 2 ? 'text-orange-300' : m >= 1.5 ? 'text-green-300' : 'text-white';

  const currentThreshold = LEVEL_THRESHOLDS[stats?.currentLevel ?? 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[(stats?.currentLevel ?? 1) + 1];
  const xpForLevel = nextThreshold != null ? nextThreshold - currentThreshold : 0;
  const xpEarned = nextThreshold != null ? (stats?.totalXP ?? 0) - currentThreshold : 0;
  const levelProgress = nextThreshold != null && xpForLevel > 0
    ? Math.min(100, Math.round((xpEarned / xpForLevel) * 100))
    : (stats ? 100 : 0);

  if (loading) return (
  <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

    {/* XP Card */}
    <div className="relative overflow-hidden bg-white/[0.06] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl">

      {/* shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="space-y-5 relative z-10">
        <div className="h-5 w-40 rounded-full bg-white/10"></div>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10"></div>

          <div className="flex-1 space-y-3">
            <div className="h-4 w-36 rounded-full bg-white/10"></div>
            <div className="h-3 w-24 rounded-full bg-white/5"></div>
          </div>
        </div>

        <div className="h-3 rounded-full bg-white/10"></div>
      </div>
    </div>

    {/* Progress Card */}
    <div className="relative overflow-hidden bg-white/[0.06] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl">

      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 space-y-5">
        <div className="h-5 w-44 rounded-full bg-white/10"></div>

        <div className="h-32 rounded-2xl bg-white/10"></div>

        <div className="space-y-3">
          <div className="h-3 rounded-full bg-white/10"></div>
          <div className="h-3 rounded-full w-4/5 bg-white/5"></div>
        </div>
      </div>
    </div>

    {/* Leaderboard */}
    <div className="relative overflow-hidden bg-white/[0.06] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl">

      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 space-y-4">
        <div className="h-5 w-36 rounded-full bg-white/10 mb-4"></div>

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-14 rounded-2xl bg-white/10"
          />
        ))}
      </div>
    </div>
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
            <div
              className="h-3 bg-white/20 rounded-full overflow-hidden mb-2"
              title={nextThreshold != null
                ? `${xpEarned.toLocaleString()} / ${xpForLevel.toLocaleString()} XP to Level ${stats.currentLevel + 1}`
                : 'Max level reached!'}
            >
              <div
                className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/50">
              {nextThreshold != null
                ? `${stats.xpToNextLevel.toLocaleString()} XP to next level · ${levelProgress}%`
                : 'Max level reached!'}
            </p>
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
                  <span className="text-sm font-bold text-yellow-300 w-6">
                    #{entry.rank}
                  </span>

                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.username}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold border border-white/15">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <span className="text-sm text-white truncate max-w-[80px]">
                    {entry.username}
                  </span>
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
              {badges.slice(0, 6).map((b: { badge_key: string; badges?: { name?: string; icon?: string } }) => (
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

   const achievementBadges = [
  {
    id: 1,
    name: "Eco Beginner",
    icon: "🌱",
    required: 0,
    color: "from-green-400 to-emerald-500",
    description: "Start your sustainability journey and earn your first eco points."
  },
  {
    id: 2,
    name: "Ocean Saver",
    icon: "🌊",
    required: 100,
    color: "from-blue-400 to-cyan-500",
    description: "Collect trash and help keep oceans clean by reaching 100 points."
  },
  {
    id: 3,
    name: "Tree Guardian",
    icon: "🌳",
    required: 250,
    color: "from-lime-400 to-green-500",
    description: "Show your dedication to nature by reaching 250 eco points."
  },
  {
    id: 4,
    name: "Recycling Hero",
    icon: "♻️",
    required: 500,
    color: "from-yellow-400 to-orange-500",
    description: "Promote responsible waste management and achieve 500 points."
  },
  {
    id: 5,
    name: "Eco Champion",
    icon: "🏆",
    required: 1000,
    color: "from-purple-400 to-pink-500",
    description: "Become a true environmental leader by earning 1000 eco points."
  },
];

  const { state, dispatch } = useGame();
  const { user, ecoVillage, dailyChallenges, gameStats } = state;
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [timeLeft, setTimeLeft] = useState('');

  const notifications = (user as any)?.notifications ?? [];

  useEffect(() => {
    if (!state.lastChallengeRefresh) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const nextRefresh = state.lastChallengeRefresh + 24 * 60 * 60 * 1000;
      const diff = nextRefresh - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const pad = (num: number) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.lastChallengeRefresh]);

  React.useEffect(() => {
    if (!notifications.length) return;

    const timer = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [dispatch, notifications.length]);



  const useCounter = (
    end: number,
    duration: number = 2000
  ) => {
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
    const villageScore =
      (ecoVillage.airQuality +
        ecoVillage.waterQuality +
        ecoVillage.biodiversity) /
      3;

    const activityScore = Math.min(
      100,
      gameStats.totalTrashCollected / 10 +
        ecoVillage.trees / 2
    );

    const completionScore = dailyChallenges.length
      ? (dailyChallenges.filter((c) => c.completed)
          .length /
          dailyChallenges.length) *
        100
      : 0;

    return Math.round(
      villageScore * 0.4 +
        activityScore * 0.3 +
        completionScore * 0.3
    );
  };

  const ecoScore = calculateEcoScore();
  const animatedEcoScore = useCounter(ecoScore);

  const pointsChange = Math.floor(totalPoints * 0.12);
  const ecoScoreChange = Math.floor((ecoScore - 65) / 5);

  const routeFor = (text: string) => {
  const t = text.toLowerCase();

  if (
    t.includes('cleanup') ||
    t.includes('ocean')
  )
    return '/ocean-cleanup-game';

  if (
    t.includes('water') ||
    t.includes('tree') ||
    t.includes('eco')
  )
    return '/eco-village';

  if (
    t.includes('learn') ||
    t.includes('course') ||
    t.includes('video')
  )
    return '/learn';

  if (t.includes('event'))
    return '/events';

  if (t.includes('community'))
    return '/community';

  return '/eco-village';
};

  const startChallenge = (title: string) => navigate(routeFor(title));

  const addProgress = (id: string, delta = 20) => {
    const challenge = dailyChallenges.find(c => c.id === id);
    if (!challenge || challenge.completed) return;

    const nextProgress = Math.min(100, (challenge.progress ?? 0) + delta);
    const justCompleted = nextProgress >= 100;

    dispatch?.({
      type: 'UPDATE_CHALLENGE',
      payload: {
        id,
        data: {
          progress: nextProgress,
          completed: justCompleted
        }
      }
    });

    if (justCompleted) {
      dispatch?.({ type: 'ADD_POINTS', payload: challenge.points, activityType: 'daily_challenge' });
    }
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

      {/* Community Events Progress Widget */}
      {authUser?.id && (
        <motion.div variants={itemVariants} className="mb-8">
          <CommunityProgress userId={authUser.id} />
        </motion.div>
      )}

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
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <TbTarget className="h-6 w-6 text-orange-400 mr-2" />
            Daily Challenges
            <span className="ml-auto text-sm text-blue-200">
              {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length} complete
            </span>
          </h2>
          {timeLeft && (
            <p className="text-xs text-orange-300 font-semibold mb-6 flex items-center gap-1">
              <span>⏱️ Next refresh in:</span>
              <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{timeLeft}</span>
            </p>
          )}
          <div className="space-y-4">
            {dailyChallenges.map((challenge) => (
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

      {/* Achievement Badges */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl"
>
  <div className="flex items-center gap-2 mb-6">
    <TbAward className="text-yellow-400 text-2xl" />
    <h2 className="text-2xl font-bold text-white">
      Achievement Badges
    </h2>
  </div>

  <p className="text-white/60 mb-6">
    Unlock badges by completing eco challenges and missions!
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {achievementBadges.map((badge) => {
      const unlocked = (user?.points || 0) >= badge.required;

      return (
        <motion.div
          title={`${badge.name} - ${badge.description}`}
whileHover={{ scale: 1.05, y: -5 }}
          key={badge.id}
          className={`rounded-2xl p-5 text-center transition-all duration-300 ${
            unlocked
              ? `bg-gradient-to-r ${badge.color} text-white shadow-lg`
              : "bg-white/5 text-gray-300 border border-white/10"
          }`}
        >
          <div className="text-5xl mb-3">
            {badge.icon}
          </div>

         <h3 className="font-bold text-lg mb-2">
  {badge.name}
</h3>

<p className="text-sm opacity-90 mb-2">
  {unlocked
    ? "Unlocked 🎉"
    : `${badge.required} points needed`}
</p>

<div className="text-xs opacity-80">
  {badge.description}
</div>

          <p className="text-sm opacity-90">
            {unlocked
              ? "Unlocked 🎉"
              : `${badge.required} points needed`}
          </p>
        </motion.div>
      );
    })}
  </div>
</motion.div>

{/* Recommended Challenges */}
<div className="mt-8">
  <RecommendedChallenges />
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
