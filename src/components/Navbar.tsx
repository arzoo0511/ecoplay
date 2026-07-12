import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Leaf, LogOut, TreePine, Users, Waves, Activity, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/journey', label: 'Journey', icon: Activity },
  { path: '/ocean-cleanup-game', label: 'Ocean Game', icon: Waves },
  { path: '/eco-village', label: 'Eco Village', icon: TreePine },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/bingo', label: 'Bingo', icon: Leaf },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/quiz', label: 'Eco-Quiz', icon: HelpCircle },
];

const linkBase =
  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-theme duration-300';
const active = 'bg-gradient-to-r from-green-500 to-blue-600 text-white dark:from-emerald-500 dark:to-teal-500';
const inactive =
  'bg-white/10 text-white hover:bg-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10';

const NavBar = () => {
  const { user: authUser, logout } = useAuth();
  const { state } = useGame();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-blue-700/40 bg-gradient-to-r from-blue-900/95 to-green-800/95 backdrop-blur-xl transition-theme duration-300 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-xl font-extrabold text-transparent dark:from-emerald-400 dark:to-teal-400"
        >
          EcoPlay
        </button>

        <div className="ml-8 hidden gap-2 md:flex">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle className="shrink-0" />
          <div className="hidden rounded-2xl bg-white/10 px-3 py-2 text-right transition-theme duration-300 sm:flex sm:flex-col dark:border dark:border-white/10 dark:bg-white/5">
            <span className="text-xs text-blue-200 dark:text-slate-400">User</span>
            <span className="text-sm font-semibold text-white dark:text-white">{authUser?.name || 'Player'}</span>
          </div>
          <div className="hidden rounded-2xl bg-white/10 px-3 py-2 text-right transition-theme duration-300 sm:flex sm:flex-col dark:border dark:border-white/10 dark:bg-white/5">
            <span className="text-xs text-blue-200 dark:text-slate-400">Points</span>
            <span className="text-sm font-semibold text-green-400 dark:text-emerald-400">{state.user.points}</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-theme duration-300 hover:bg-white/20 dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-theme duration-300 dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-100 md:hidden"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 transition-theme duration-300 dark:border-white/10 md:hidden">
          <div className="flex flex-col gap-2 rounded-2xl bg-black/20 p-3 backdrop-blur-xl dark:border dark:border-white/10 dark:bg-gray-800/80">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
