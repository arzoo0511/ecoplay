import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbSparkles,
  TbAward,
  TbConfetti,
  TbX,
  TbShare2,
  TbUsers,
  TbChevronRight
} from 'react-icons/tb';

interface CompletedEvent {
  id: string;
  title: string;
  icon: string;
  goal: number;
  unit: string;
  xp_reward: number;
  badge_id?: string | null;
  participantCount?: number;
  communityProgress?: number;
}

interface EventCompletionModalProps {
  event: CompletedEvent | null;
  userContribution: number;
  onClose: () => void;
  onShare?: () => void;
}

const confettiColors = [
  'bg-yellow-400', 'bg-emerald-400', 'bg-pink-400',
  'bg-blue-400', 'bg-purple-400', 'bg-orange-400',
  'bg-cyan-400', 'bg-red-400'
];

const ConfettiParticle: React.FC<{ delay: number; index: number }> = ({ delay, index }) => {
  const color = confettiColors[index % confettiColors.length];
  const left = `${10 + Math.random() * 80}%`;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, 200 + Math.random() * 200],
        x: [-30 + Math.random() * 60, -60 + Math.random() * 120],
        rotate: [rotation, rotation + 360 + Math.random() * 360],
        scale: [1, 0.5]
      }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeOut' }}
      className={`absolute ${color} rounded-sm pointer-events-none`}
      style={{ left, top: 0, width: size, height: size }}
    />
  );
};

export const EventCompletionModal: React.FC<EventCompletionModalProps> = ({
  event,
  userContribution,
  onClose,
  onShare
}) => {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => setShowStats(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowStats(false);
    }
  }, [event]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!event) return null;

  const shareText = `🌍 We did it! The "${event.title}" community event reached its goal of ${event.goal.toLocaleString()} ${event.unit}! I contributed ${userContribution.toLocaleString()} ${event.unit}. Join EcoPlay and make a difference! 🌱`;

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      navigator.share({ title: 'EcoPlay - Event Completed!', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Share text copied to clipboard!');
      });
    }
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl"
          >
            {/* Confetti Container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {Array.from({ length: 30 }).map((_, i) => (
                <ConfettiParticle key={i} index={i} delay={i * 0.06} />
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Close modal"
            >
              <TbX className="h-5 w-5" />
            </button>

            {/* Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 px-8 pt-10 pb-8 text-center">
              {/* Victory Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-5 relative"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-5xl filter drop-shadow-md select-none">{event.icon}</span>
                </div>
                {/* Badge ring animation */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-yellow-400/40"
                />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TbConfetti className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-yellow-400">
                    Mission Complete
                  </span>
                  <TbConfetti className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                <p className="text-sm text-slate-400 mb-6">
                  The community reached the goal of{' '}
                  <span className="font-bold text-emerald-400">
                    {event.goal.toLocaleString()} {event.unit}
                  </span>
                  !
                </p>
              </motion.div>

              {/* Stats Cards */}
              <AnimatePresence>
                {showStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3 mb-6"
                  >
                    {/* XP Earned */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <TbAward className="h-5 w-5 text-yellow-400 mx-auto mb-1.5" />
                      <p className="text-lg font-black text-yellow-400">+{event.xp_reward}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">XP Earned</p>
                    </div>

                    {/* Your Contribution */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <TbSparkles className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                      <p className="text-lg font-black text-emerald-400">{userContribution.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{event.unit}</p>
                    </div>

                    {/* Participants */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <TbUsers className="h-5 w-5 text-blue-400 mx-auto mb-1.5" />
                      <p className="text-lg font-black text-blue-400">{event.participantCount ?? 0}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Warriors</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badge Unlocked */}
              {event.badge_id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mb-6 p-3 rounded-xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/25"
                >
                  <p className="text-xs font-black uppercase tracking-wider text-purple-400 mb-1 flex items-center justify-center gap-1">
                    <TbAward className="h-4 w-4" /> Badge Unlocked!
                  </p>
                  <p className="text-sm text-white font-medium">
                    You earned the <span className="text-purple-300 font-bold">{event.badge_id}</span> badge
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 text-white font-bold py-3 px-4 text-sm hover:bg-white/15 transition-all active:scale-95"
                >
                  <TbShare2 className="h-4 w-4" /> Share
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 text-sm hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Continue <TbChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
