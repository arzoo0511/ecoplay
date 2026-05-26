import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbUsers,
  TbClock,
  TbAward,
  TbCirclePlus,
  TbCircleMinus,
  TbFlame,
  TbSparkles,
  TbCalendarEvent,
  TbCircleCheck
} from 'react-icons/tb';
import { dbFunctions } from '../lib/supabase';

interface Milestone {
  at: number;
  label: string;
  xpBonus: number;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  theme: string;
  icon: string;
  goal: number;
  unit: string;
  start_date: string;
  end_date: string;
  xp_reward: number;
  badge_id?: string | null;
  milestones: Milestone[];
  is_seasonal: boolean;
  is_active: boolean;
  status?: 'active' | 'upcoming' | 'ended';
  communityProgress?: number;
  participantCount?: number;
}

interface EventCardProps {
  event: CommunityEvent;
  userId: string;
  userContribution: number;
  onContribute: (data: {
    contribution: number;
    communityProgress: number;
    xpAwarded: number;
    milestonesUnlocked: Milestone[];
    goalReached: boolean;
  }) => void;
}

const THEME_STYLES: Record<string, {
  gradient: string;
  border: string;
  badge: string;
  progress: string;
  milestone: string;
  button: string;
  text: string;
}> = {
  green: {
    gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
    border: 'border-emerald-500/30 dark:border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25',
    progress: 'bg-gradient-to-r from-emerald-500 to-green-400',
    milestone: 'bg-emerald-500',
    button: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  blue: {
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    border: 'border-blue-500/30 dark:border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/25',
    progress: 'bg-gradient-to-r from-blue-500 to-indigo-400',
    milestone: 'bg-blue-500',
    button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400'
  },
  cyan: {
    gradient: 'from-cyan-500/10 via-sky-500/5 to-transparent',
    border: 'border-cyan-500/30 dark:border-cyan-500/20',
    badge: 'bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-500/25',
    progress: 'bg-gradient-to-r from-cyan-500 to-sky-400',
    milestone: 'bg-cyan-500',
    button: 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 shadow-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400'
  }
};

function useCountdown(dateStr: string) {
  const getTimeLeft = useCallback(() => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false
    };
  }, [dateStr]);

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [getTimeLeft]);

  return timeLeft;
}

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center bg-black/20 dark:bg-white/5 border border-white/10 rounded-lg p-2 min-w-12 backdrop-blur-md">
    <span className="text-xl font-bold text-white font-mono">{String(value).padStart(2, '0')}</span>
    <span className="text-[9px] uppercase tracking-wider text-white/60 font-semibold mt-0.5">{label}</span>
  </div>
);

export const EventCard: React.FC<EventCardProps> = ({
  event,
  userId,
  userContribution = 0,
  onContribute
}) => {
  const theme = THEME_STYLES[event.theme] || THEME_STYLES.green;
  const timeLeft = useCountdown(event.status === 'upcoming' ? event.start_date : event.end_date);
  
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [localProgress, setLocalProgress] = useState(event.communityProgress || 0);
  const [localUserContrib, setLocalUserContrib] = useState(userContribution);
  const [celebratedMilestone, setCelebratedMilestone] = useState<Milestone | null>(null);

  const progressPct = Math.min((localProgress / event.goal) * 100, 100);
  const milestones = event.milestones || [];

  const handleContribute = async () => {
    if (!userId || loading || event.status !== 'active') return;
    setLoading(true);

    try {
      const data = await dbFunctions.contributeToEvent(userId, event.id, amount);

      if (data.success) {
        setLocalProgress(data.communityProgress);
        setLocalUserContrib(data.contribution);

        if (data.milestonesUnlocked && data.milestonesUnlocked.length > 0) {
          setCelebratedMilestone(data.milestonesUnlocked[0]);
          setTimeout(() => setCelebratedMilestone(null), 4000);
        }

        onContribute(data);
      } else {
        alert(data.error || 'Failed to record contribution');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = event.status === 'upcoming';
  const isEnded = event.status === 'ended';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl transition-all duration-300`}
    >
      {/* Dynamic Background Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />

      {/* Floating Badges */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {event.is_seasonal && (
          <span className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-500 dark:text-yellow-400 uppercase tracking-wide">
            <TbSparkles className="h-3 w-3" /> Seasonal
          </span>
        )}
      </div>

      {/* Header Info */}
      <div className="flex gap-4 items-start relative z-10">
        <span className="text-5xl select-none filter drop-shadow-md leading-none">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate">{event.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
            {event.description}
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-2 mt-4 relative z-10">
        {isEnded ? (
          <span className="rounded-md bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
            Completed
          </span>
        ) : isUpcoming ? (
          <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
            <TbCalendarEvent className="h-3.5 w-3.5" /> Upcoming
          </span>
        ) : (
          <span className="rounded-md bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live Mission
          </span>
        )}
      </div>

      {/* Countdown Timer */}
      {!isEnded && (
        <div className="mt-5 relative z-10 bg-slate-800/15 dark:bg-black/20 border border-white/5 rounded-xl p-3.5">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            <TbClock className="h-3.5 w-3.5" /> {isUpcoming ? 'Starts In' : 'Remaining Time'}
          </span>
          {timeLeft.expired ? (
            <span className="text-sm font-bold text-slate-400">Refreshing event status...</span>
          ) : (
            <div className="flex items-center gap-2.5">
              <CountdownUnit value={timeLeft.days} label="Days" />
              <span className="text-lg font-bold text-white/50 font-mono">:</span>
              <CountdownUnit value={timeLeft.hours} label="Hours" />
              <span className="text-lg font-bold text-white/50 font-mono">:</span>
              <CountdownUnit value={timeLeft.minutes} label="Mins" />
              <span className="text-lg font-bold text-white/50 font-mono">:</span>
              <CountdownUnit value={timeLeft.seconds} label="Secs" />
            </div>
          )}
        </div>
      )}

      {/* Progress Bar & Milestone Pins */}
      <div className="mt-6 relative z-10 space-y-2.5">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-300">Global Progress</span>
          <span className={`font-bold ${theme.text}`}>
            {localProgress.toLocaleString()} / {event.goal.toLocaleString()} {event.unit}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-4 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${theme.progress} relative`}
          >
            <div className="absolute inset-0 bg-white/15 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]" />
          </motion.div>

          {/* Milestones Pin Indicators */}
          {milestones.map((m) => {
            const pos = (m.at / event.goal) * 100;
            const reached = localProgress >= m.at;
            return (
              <div
                key={m.at}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-default group"
                style={{ left: `${pos}%` }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 transition-all duration-500 shadow ${
                    reached ? `${theme.milestone} scale-110` : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-bold border border-white/10 shadow-lg">
                  {m.label} ({m.at.toLocaleString()})
                </span>
              </div>
            );
          })}
        </div>

        {/* Milestone Unlocks List */}
        {milestones.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {milestones.map((m) => {
              const reached = localProgress >= m.at;
              return (
                <span
                  key={m.at}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-all ${
                    reached
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                      : 'bg-slate-400/5 text-slate-500 border-slate-500/10'
                  }`}
                >
                  {reached ? (
                    <TbCircleCheck className="h-3.5 w-3.5 text-yellow-500" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                  )}
                  {m.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 relative z-10">
        <span className="flex items-center gap-1">
          <TbUsers className="h-4 w-4" />
          <span className="font-bold text-slate-800 dark:text-white">
            {event.participantCount ?? 0}
          </span>{' '}
          joined
        </span>
        <span className="flex items-center gap-1">
          <TbAward className="h-4 w-4 text-yellow-500" /> Goal Reward:
          <span className="font-bold text-yellow-600 dark:text-yellow-400">+{event.xp_reward} XP</span>
        </span>
      </div>

      {/* Actions (If User logged in + active event) */}
      {!isEnded && userId && (
        <div className="mt-5 relative z-10 pt-1">
          {localUserContrib > 0 && (
            <div className={`flex items-center gap-1.5 text-xs font-bold ${theme.text} mb-3.5`}>
              <TbCircleCheck className="h-4 w-4" /> My Contribution: {localUserContrib.toLocaleString()}{' '}
              {event.unit}
            </div>
          )}

          {!isUpcoming ? (
            <div className="flex gap-3">
              {/* Stepper Controls */}
              <div className="flex items-center border border-white/10 dark:border-white/15 bg-black/10 dark:bg-black/30 rounded-xl overflow-hidden shadow-inner">
                <button
                  onClick={() => setAmount((p) => Math.max(1, p - 1))}
                  className="p-3 text-slate-800 dark:text-white hover:bg-white/5 transition-colors"
                  aria-label="Decrease contribution"
                >
                  <TbCircleMinus className="h-4.5 w-4.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800 dark:text-white font-mono">
                  {amount}
                </span>
                <button
                  onClick={() => setAmount((p) => Math.min(100, p + 1))}
                  className="p-3 text-slate-800 dark:text-white hover:bg-white/5 transition-colors"
                  aria-label="Increase contribution"
                >
                  <TbCirclePlus className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Action Button */}
              <button
                disabled={loading}
                onClick={handleContribute}
                className={`flex-1 rounded-xl font-bold text-white text-sm py-3 px-4 ${theme.button} flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <TbFlame className="h-4.5 w-4.5" /> Contribute {amount}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 py-3 px-4 text-center text-xs font-semibold text-amber-600 dark:text-amber-400">
              ⚡ Mission starts soon. Set your reminders!
            </div>
          )}
        </div>
      )}

      {/* Mini Celebration Banner */}
      <AnimatePresence>
        {celebratedMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute inset-x-6 bottom-6 z-30 border border-yellow-500/40 bg-yellow-500/10 dark:bg-yellow-950/40 rounded-xl p-3 flex items-center gap-2.5 backdrop-blur-md shadow-lg"
          >
            <TbSparkles className="h-5 w-5 text-yellow-500 shrink-0 animate-spin" />
            <div>
              <h4 className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                Milestone Unlocked!
              </h4>
              <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {celebratedMilestone.label} reached! +{celebratedMilestone.xpBonus} XP Awarded 🌟
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
