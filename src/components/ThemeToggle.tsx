import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-theme duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
        {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
      {showLabel && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
};

export default ThemeToggle;
