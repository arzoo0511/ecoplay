import React from 'react';
import { useLocation } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loc = useLocation();
  const isLogin = loc.pathname === '/login';

  return (
    <div className="relative min-h-screen overflow-hidden transition-theme duration-300 dark:bg-slate-950 dark:text-slate-50">
      <AnimatedBackground />
      <div className="pointer-events-none absolute inset-0 z-[1] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(13,148,136,0.16),_transparent_26%)]" />

      {!isLogin && <Navbar />}

      <main className="relative z-10 px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
