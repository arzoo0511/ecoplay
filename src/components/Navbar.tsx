import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Waves, 
  TreePine, 
  BookOpen, 
  Calendar, 
  Users, 
  Menu, 
  X,
  Leaf
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/ocean-cleanup', label: 'Ocean Cleanup', icon: Waves },
  { path: '/eco-village', label: 'Eco Village', icon: TreePine },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/bingo', label: 'Bingo', icon: Leaf }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-gradient-to-r from-blue-900/95 to-green-800/95 backdrop-blur-lg border-b border-blue-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="bg-green-500 p-2 rounded-full"
            >
              <Leaf className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white">EcoPlay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-green-400 transition-colors p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0
          }}
          className="md:hidden overflow-hidden bg-blue-900/95 backdrop-blur-lg rounded-lg mt-2 mb-4"
        >
          <div className="py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white border-r-2 border-green-400' 
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;