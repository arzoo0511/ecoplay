import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Activity,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getOrGenerateJourney,
  fetchUserTimeline,
  fetchUserMilestones,
  fetchGlobalRanking,
  JourneyStats,
} from "../services/ai_journey";

export default function Journey() {
  const { user } = useAuth();
  const [journeyStats, setJourneyStats] = useState<JourneyStats | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [globalRankings, setGlobalRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const stats = await getOrGenerateJourney(user.id);
          setJourneyStats(stats);

          const timelineData = await fetchUserTimeline(user.id);
          setTimeline(timelineData);

          const milestoneData = await fetchUserMilestones(user.id);
          setMilestones(milestoneData);

          const rankingData = await fetchGlobalRanking();
          setGlobalRankings(rankingData);
        } catch (err) {
          console.error("Failed to load journey data:", err);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Your Eco Journey</h1>
        <p className="text-emerald-400 text-lg">
          Powered by AI Sustainability Tracking
        </p>
      </motion.div>

      {/* Smart Motivation Engine */}
      {journeyStats?.motivationMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Zap size={64} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Zap className="text-yellow-300" /> AI Eco-Motivator
          </h2>
          <p className="text-white text-lg font-medium">
            {journeyStats.motivationMessage}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analytics and Goals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sustainability Score Prediction */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" /> Prediction Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 mb-1">Predicted Score</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {journeyStats?.predictedScore}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 mb-1">Consistency Trend</p>
                <p
                  className={`text-xl font-bold ${journeyStats?.consistencyTrend === "Improving" ? "text-green-400" : journeyStats?.consistencyTrend === "Declining" ? "text-red-400" : "text-yellow-400"}`}
                >
                  {journeyStats?.consistencyTrend}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 mb-1">Streak Risk</p>
                <p className="text-xl font-bold text-white">
                  {journeyStats?.streakLossProbability}%
                </p>
              </div>
            </div>
          </div>

          {/* AI Weekly Goals */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="text-emerald-500" /> AI-Generated Goals
            </h2>
            <div className="space-y-4">
              {journeyStats?.weeklyGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between border border-gray-700/50 hover:border-emerald-500/50 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-white">{goal.title}</h3>
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    +{goal.xpReward} XP
                  </div>
                </motion.div>
              ))}
              {journeyStats?.weeklyGoals.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-900/30 border border-gray-700/30 rounded-xl max-w-sm mx-auto space-y-2 my-2">
                  <Target className="h-6 w-6 text-emerald-500/50 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">
                    All Caught Up!
                  </h4>
                  <p className="text-xs text-gray-400">
                    No new goals generated yet. Check back soon for your
                    personalized AI sustainability challenges!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Eco Journey Timeline */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-emerald-500" /> Journey Timeline
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
              {timeline.length > 0 ? (
                timeline.map((activity, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-900 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Activity size={18} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/80 p-4 rounded border border-gray-700 shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-white">
                          {activity.activity_type.replace(/_/g, " ")}
                        </div>
                        <time className="font-caveat font-medium text-emerald-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </time>
                      </div>
                      <div className="text-slate-400 text-sm">
                        Earned {activity.xp_awarded} XP
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900/30 border border-gray-700/30 rounded-xl max-w-md mx-auto space-y-3 z-10">
                  <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Your Timeline is Empty
                    </h4>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      You haven't logged any eco-actions yet. Complete games,
                      read articles, or participate in missions to kickstart
                      your log!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Milestones */}
        <div className="space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-emerald-500" /> Milestones
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {milestones.length > 0 ? (
                milestones.map((ms, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-900/50 p-4 rounded-xl text-center border border-gray-700/50 flex flex-col items-center justify-center"
                  >
                    <div className="text-4xl mb-2">
                      {ms.badges?.icon || "🏆"}
                    </div>
                    <h3 className="font-bold text-white text-sm leading-tight">
                      {ms.badges?.name || ms.badge_key}
                    </h3>
                    <p className="text-xs text-emerald-400 mt-1">
                      {new Date(ms.earned_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center text-center p-6 bg-gray-800/50 border border-gray-700/50 rounded-xl space-y-4 w-full">
                  <div className="p-3 bg-gray-900/60 rounded-full border border-gray-700 text-gray-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">
                      No Milestones Unlocked
                    </h4>
                    <p className="text-xs text-gray-400 max-w-[220px] mx-auto">
                      Earn custom badges and achievements by increasing your
                      total XP across the platform.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      window.location.href = "/dashboard";
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-xs rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md shadow-emerald-500/10"
                  >
                    🌱 Earn Your First Badge
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Global Ranking */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="text-emerald-500" /> Community Ranking
            </h2>
            <div className="space-y-4">
              {globalRankings.length > 0 ? (
                globalRankings.map((rank, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${rank.user_id === user?.id ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-gray-900/50 border border-gray-700/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {rank.name}
                        </h3>
                        <p className="text-xs text-emerald-400">
                          Lvl {rank.current_level} • {rank.total_xp} XP
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  <p>Leaderboard not available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
