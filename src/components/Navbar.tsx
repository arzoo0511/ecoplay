import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Waves, TreePine, BookOpen, Users, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/ocean-cleanup-game', label: 'Ocean Game', icon: Waves },
  { path: '/eco-village', label: 'Eco Village', icon: TreePine },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/bingo', label: 'Bingo', icon: Leaf },
  { path: '/community', label: 'Community', icon: Users }
];

const linkBase = 'px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2';
const active = 'bg-gradient-to-r from-green-500 to-blue-600 text-white';
const inactive = 'bg-white/10 text-white hover:bg-white/20';

const NavBar = () => {
  const { user: authUser, logout } = useAuth();
  const { state } = useGame();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-blue-900/95 to-green-800/95 backdrop-blur-lg border-b border-blue-700/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
        >
          EcoPlay
        </button>

        <div className="hidden md:flex ml-8 gap-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-blue-200">User</span>
            <span className="text-sm font-semibold text-white">{authUser?.name || 'Player'}</span>
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-blue-200">Points</span>
            <span className="text-sm font-semibold text-green-400">{state.user.points}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden px-3 py-2 rounded-lg bg-white/10 text-white text-xs"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2">
          {navItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;