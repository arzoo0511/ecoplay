import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TbGlobe, TbChevronRight, TbUsers } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { dbFunctions, CommunityEvent } from '../lib/supabase';

interface CommunityProgressProps {
  userId: string;
}

export const CommunityProgress: React.FC<CommunityProgressProps> = ({ userId }) => {
  const [activeEvent, setActiveEvent] = useState<CommunityEvent | null>(null);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const { events } = await dbFunctions.getCommunityEvents(userId);
        const active = (events || []).filter((e: CommunityEvent) => e.status === 'active');
        if (active.length > 0) {
          setActiveEvent(active[0]);
          setEventsCount(active.length);
        }
      } catch (e) {
        console.error('Error fetching dashboard progress widget:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-white/10 dark:bg-slate-900/40 rounded-2xl p-5 border border-white/10">
        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-4" />
        <div className="h-2 w-full bg-slate-300 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  if (!activeEvent) return null;

  const pct = Math.min((activeEvent.communityProgress / activeEvent.goal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl p-5 shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
        {/* Title Indicator */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <TbGlobe className="h-4 w-4" /> Global Community Mission
          </span>
        </div>

        {/* View Link */}
        <Link
          to="/events"
          state={{ tab: 'community' }}
          className="group flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Contribute Now
          <TbChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Main Info */}
      <div className="mt-4 flex items-center gap-3.5 relative z-10">
        <span className="text-4xl filter drop-shadow-md select-none">{activeEvent.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-white mb-1.5">
            <span className="truncate pr-4">{activeEvent.title}</span>
            <span className="text-xs font-black font-mono">{Math.round(pct)}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 relative"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 bg-white/15 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem]" />
            </div>
          </div>

          {/* Details footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <TbUsers className="h-3.5 w-3.5" /> {activeEvent.participantCount ?? 0} active eco-warriors
            </span>
            {eventsCount > 1 && (
              <span>+{eventsCount - 1} other community event{eventsCount - 1 > 1 ? 's' : ''} live</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
