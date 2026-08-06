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
      .catch(err => console.error(err))