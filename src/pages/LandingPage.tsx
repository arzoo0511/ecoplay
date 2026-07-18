import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  Waves,
  TreePine,
  Users,
  BookOpen,
  Zap,
  Globe,
  Award,
  ChevronDown,
  Play,
  Star,
  ArrowRight,
  Fish,
  Wind,
  Droplets,
  Target,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import UnderwaterBackground from '../components/UnderwaterBackground';

// ─── Reusable animated section wrapper ───────────────────────
const FadeInSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : 0,
      x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Stat counter with animation ─────────────────────────────
const AnimatedStat: React.FC<{ value: number; suffix: string; label: string; icon: React.ReactNode }> = ({
  value, suffix, label, icon,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-4xl lg:text-5xl font-bold text-white mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-blue-200 text-sm font-medium">{label}</p>
    </div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}> = ({ icon, title, description, gradient, delay }) => (
  <FadeInSection delay={delay}>
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 overflow-hidden cursor-default h-full"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
    </motion.div>
  </FadeInSection>
);

// ─── Game Showcase Card ───────────────────────────────────────
const GameCard: React.FC<{
  emoji: string;
  title: string;
  description: string;
  tags: string[];
  path: string;
  delay: number;
  onNavigate: (path: string) => void;
}> = ({ emoji, title, description, tags, path, delay, onNavigate }) => (
  <FadeInSection delay={delay}>
    <motion.div
      whileHover={{ y: -8 }}
      className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => onNavigate(path)}
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed mb-4 flex-1">{description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-400/30">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center text-green-400 text-sm font-semibold group-hover:gap-2 gap-1 transition-all">
        <Play className="h-4 w-4" />
        <span>Play Now</span>
        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  </FadeInSection>
);

// ─── Testimonial / Community Card ────────────────────────────
const CommunityCard: React.FC<{
  avatar: string;
  name: string;
  quote: string;
  stat: string;
  delay: number;
}> = ({ avatar, name, quote, stat, delay }) => (
  <FadeInSection delay={delay}>
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{avatar}</span>
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-green-400 text-xs font-bold">{stat}</p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>
      <p className="text-blue-100 text-sm italic leading-relaxed flex-1">"{quote}"</p>
    </div>
  </FadeInSection>
);

// ─── Navbar for Landing ───────────────────────────────────────
const LandingNav: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        
        scrolled
                 
        ? 'bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg'
        : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <button

  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  className="flex items-center"
>
  <img
    src="/logo.png"
    alt="EcoPlay Logo"
    className="h-12 md:h-14 w-auto object-contain"
  />
</button>


        <div className="flex items-center gap-3">
          <ThemeToggle className="shrink-0" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('/login')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white dark:text-slate-100 bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 transition-colors"
          >
            Sign In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('/login')}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-green-500 to-blue-600 dark:from-emerald-500 dark:to-teal-600 text-white hover:from-green-600 hover:to-blue-700 dark:hover:from-emerald-600 dark:hover:to-teal-700 transition-all shadow-md"
          >
            Get Started Free
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

// ─── Main Landing Page ────────────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToLogin = () => navigate('/login');

  const features = [
    {
      icon: <Waves className="h-7 w-7 text-white" />,
      title: 'Ocean Cleanup Game',
      description: 'Dive into an interactive ocean environment. Collect trash, avoid obstacles, build combos, and compete on global leaderboards.',
      gradient: 'from-blue-500 to-cyan-400',
      delay: 0,
    },
    {
      icon: <TreePine className="h-7 w-7 text-white" />,
      title: 'Eco Village Builder',
      description: 'Build and grow your own eco village. Plant trees, install solar panels, and watch your environment transform from polluted to pristine.',
      gradient: 'from-green-500 to-emerald-400',
      delay: 0.1,
    },
    {
      icon: <BookOpen className="h-7 w-7 text-white" />,
      title: 'Learning Center',
      description: 'Access curated videos, articles, and interactive content about climate change, ocean conservation, and renewable energy.',
      gradient: 'from-purple-500 to-pink-400',
      delay: 0.2,
    },
    {
      icon: <Users className="h-7 w-7 text-white" />,
      title: 'Eco Community',
      description: 'Connect with fellow eco-warriors. Share tips, ask questions, post projects, and inspire collective action.',
      gradient: 'from-orange-500 to-yellow-400',
      delay: 0.3,
    },
    {
      icon: <Target className="h-7 w-7 text-white" />,
      title: 'SDG Bingo Challenge',
      description: "Complete real-world tasks aligned with the UN's 17 Sustainable Development Goals and earn points for your impact.",
      gradient: 'from-red-500 to-pink-400',
      delay: 0.4,
    },
    {
      icon: <Zap className="h-7 w-7 text-white" />,
      title: 'Gamification System',
      description: 'Earn XP, level up, unlock badges, maintain daily streaks, and climb the global leaderboard.',
      gradient: 'from-yellow-500 to-orange-400',
      delay: 0.5,
    },
  ];

  const games = [
    {
      emoji: '🌊',
      title: 'Ocean Cleanup Challenge',
      description: 'Click to collect trash items from the ocean floor. Build combos, avoid fish obstacles, and score big in 30-second rounds.',
      tags: ['Click-to-play', 'Leaderboard', 'Combos'],
      path: '/login',
      delay: 0,
    },
    {
      emoji: '🌍',
      title: 'SDG Bingo Wheel',
      description: 'Spin the SDG wheel and complete real-world environmental tasks aligned with all 17 UN Sustainable Development Goals.',
      tags: ['Real-world tasks', '17 Goals', 'Points'],
      path: '/login',
      delay: 0.15,
    },
    {
      emoji: '🏡',
      title: 'Eco Village Builder',
      description: 'Your personal eco village starts barren. Spend your earned points on trees, solar panels, water filters and watch it bloom.',
      tags: ['Simulation', 'Resource management', 'Visual'],
      path: '/login',
      delay: 0.3,
    },
  ];

  const communityCards = [
    {
      avatar: '🌱',
      name: 'EcoEnthusiast',
      quote: "EcoPlay made environmental learning actually fun. I've planted 12 virtual trees and joined 3 beach cleanups IRL after just a month!",
      stat: '2,400 pts · Level 8',
      delay: 0,
    },
    {
      avatar: '♻️',
      name: 'ZeroWasteZara',
      quote: 'The SDG Bingo challenge pushed me to take real actions. I reduced my plastic use by 80% just from the challenges here.',
      stat: '5,100 pts · Level 14',
      delay: 0.15,
    },
    {
      avatar: '⚡',
      name: 'SolarSaver',
      quote: 'The leaderboard competitive spirit is real! My whole office signed up just to beat each other on the ocean cleanup scores.',
      stat: '3,850 pts · Level 11',
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Global background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-cyan-500 via-sky-700 to-blue-950 dark:from-sky-1000 dark:via-blue-950 dark:to-slate-950" />
      <UnderwaterBackground />

      <LandingNav onNavigate={navigate} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16"
      >
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
            <Leaf className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 bg-green-500/20 dark:bg-emerald-500/20 border border-green-400/30 dark:border-emerald-400/30 text-green-300 dark:text-emerald-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Globe className="h-4 w-4" />
            <span>Gamified Environmental Education</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white dark:text-slate-50 leading-tight mb-6 max-w-4xl mx-auto">
            Save the Planet,{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              One Game at a Time
            </span>
          </h1>

          <p className="text-xl text-blue-100 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            EcoPlay makes sustainability fun, measurable, and community-driven. Play games, earn points,
            build your eco village, and make a real difference — all in one platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(74, 222, 128, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={goToLogin}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-emerald-500 dark:to-teal-600 hover:from-green-600 hover:to-emerald-700 dark:hover:from-emerald-600 dark:hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl transition-all"
          >
            <Zap className="h-5 w-5" />
            Start Playing Free
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToFeatures}
            className="flex items-center gap-2 bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 backdrop-blur-sm border border-white/30 dark:border-white/30 text-white dark:text-slate-100 font-bold py-4 px-8 rounded-xl text-lg transition-all"
          >
            <Play className="h-5 w-5" />
            See How It Works
          </motion.button>
        </motion.div>

        {/* Mini stats preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-6 text-sm"
        >
          {['🌊 Ocean Cleanup Game', '🌳 Eco Village Builder', '🌍 SDG Challenges', '👥 Active Community'].map((item) => (
            <span key={item} className="text-blue-200 dark:text-slate-300 bg-white/5 dark:bg-white/5 px-3 py-1.5 rounded-full border border-white/10 dark:border-white/10">
              {item}
            </span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
      aria-label="Scroll down to features section"
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      onClick={scrollToFeatures}
      className="absolute bottom-10 text-white/50 dark:text-white/50 hover:text-white/80 dark:hover:text-white/80"
    >
          <ChevronDown className="h-8 w-8" />
        </motion.button>
      </motion.section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <Award className="h-4 w-4" />
                <span>Everything you need</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                A Full Eco Platform,{' '}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Built for Impact
                </span>
              </h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Games, education, community, and gamification — all woven together into one seamless eco experience.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMES SHOWCASE ───────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <Zap className="h-4 w-4" />
                <span>Gamified Learning</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Play & Learn</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Real gameplay, real environmental impact. Each game teaches sustainability while being genuinely fun.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((g) => (
              <GameCard key={g.title} {...g} onNavigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / ENVIRONMENTAL SECTION ─────────────────── */}
      <section className="relative z-10 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection direction="left">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                  <Globe className="h-4 w-4" />
                  <span>Our Mission</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                  Real Actions,{' '}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                    Real Impact
                  </span>
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-6">
                  EcoPlay bridges the gap between education and action. Every game teaches real environmental concepts.
                  Every point earned reflects genuine sustainability effort.
                </p>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                  From individual daily challenges to global community events, we make it easy — and rewarding —
                  to live a more sustainable life.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Fish className="h-5 w-5 text-blue-400" />, text: 'Ocean Conservation' },
                    { icon: <Wind className="h-5 w-5 text-cyan-400" />, text: 'Clean Energy' },
                    { icon: <Droplets className="h-5 w-5 text-blue-300" />, text: 'Water Protection' },
                    { icon: <TreePine className="h-5 w-5 text-green-400" />, text: 'Reforestation' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                      {icon}
                      <span className="text-white text-sm font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection direction="right" delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: '🌊', label: 'Ocean Cleanup', desc: 'Remove virtual trash, inspire real change' },
                  { emoji: '🌳', label: 'Tree Planting', desc: 'Every point plants impact in your eco village' },
                  { emoji: '☀️', label: 'Solar Energy', desc: 'Learn and simulate clean energy systems' },
                  { emoji: '♻️', label: 'Zero Waste', desc: 'SDG challenges for real waste reduction' },
                ].map(({ emoji, label, desc }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center"
                  >
                    <div className="text-4xl mb-3">{emoji}</div>
                    <h4 className="text-white font-bold text-sm mb-1">{label}</h4>
                    <p className="text-blue-200 text-xs">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-12">
            <FadeInSection>
              <h2 className="text-3xl font-black text-white text-center mb-12">Platform Highlights</h2>
            </FadeInSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatedStat
                value={2400}
                suffix="+"
                label="Active Players"
                icon={<Users className="h-8 w-8 text-green-400" />}
              />
              <AnimatedStat
                value={17}
                suffix=""
                label="SDG Goals Covered"
                icon={<Globe className="h-8 w-8 text-blue-400" />}
              />
              <AnimatedStat
                value={50000}
                suffix="+"
                label="Trash Items Collected"
                icon={<Waves className="h-8 w-8 text-cyan-400" />}
              />
              <AnimatedStat
                value={12000}
                suffix="+"
                label="Trees Planted (Virtual)"
                icon={<TreePine className="h-8 w-8 text-emerald-400" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <Users className="h-4 w-4" />
                <span>Community Stories</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Players Making a Difference
              </h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Join thousands of eco-warriors turning gameplay into real-world environmental action.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityCards.map((c) => (
              <CommunityCard key={c.name} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="relative bg-gradient-to-r from-green-600/30 to-blue-600/30 backdrop-blur-lg rounded-3xl border border-green-400/30 p-12 text-center overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-400/20 rounded-full blur-3xl pointer-events-none" />

              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-6xl mb-6"
              >
                🌍
              </motion.div>

              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Ready to Save the Planet?
              </h2>
              <p className="text-blue-100 text-xl mb-8 max-w-xl mx-auto">
                Join EcoPlay for free. Start playing, earning, and making a real difference today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(74, 222, 128, 0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goToLogin}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-xl transition-all"
                >
                  <Leaf className="h-5 w-5" />
                  Join EcoPlay — It's Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all"
                >
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>

              <p className="text-blue-300 text-sm mt-6 opacity-70">
                No credit card required · Free forever · Made for Earth 🌱
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-3">
                EcoPlay
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                A gamified environmental education platform that makes sustainability fun, measurable, and community-driven.
              </p>
            </div>

            {[
              {
                title: 'Platform',
                links: ['Dashboard', 'Ocean Game', 'Eco Village', 'Bingo'],
                paths: ['/dashboard', '/ocean-cleanup-game', '/eco-village', '/bingo'],
              },
              {
                title: 'Learn',
                links: ['Learning Center', 'Community', 'Events'],
                paths: ['/learn', '/community', '/events'],
              },
              {
                title: 'Project',
                links: ['GitHub', 'Contributing', 'Architecture', 'MIT License'],
                paths: [
                  'https://github.com/arzoo0511/ecoplay',
                  'https://github.com/arzoo0511/ecoplay/blob/main/docs/CONTRIBUTING.md',
                  'https://github.com/arzoo0511/ecoplay/blob/main/docs/ARCHITECTURE.md',
                  'https://github.com/arzoo0511/ecoplay/blob/main/LICENSE',
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-bold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={link}>
                      <button
                        onClick={() => {
                          const path = col.paths[i];
                          if (path.startsWith('http')) {
                            window.open(path, '_blank', 'noopener,noreferrer');
                          } else {
                            navigate('/login');
                          }
                        }}
                        className="text-blue-200 hover:text-green-400 text-sm transition-colors text-left"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-blue-300 text-sm">
              © 2025 EcoPlay. Made with 💚 for our planet Earth 🌍
            </p>
            <div className="flex items-center gap-1 text-blue-300 text-sm">
              <span>Open Source · MIT License ·</span>
              <button
                onClick={() => window.open('https://github.com/arzoo0511/ecoplay', '_blank', 'noopener,noreferrer')}
                className="text-green-400 hover:text-green-300 transition-colors ml-1"
              >
                Contribute on GitHub
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
