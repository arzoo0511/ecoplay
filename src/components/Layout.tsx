import React from 'react';
import { useLocation } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import NavBar from './NavBar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loc = useLocation();
  const isLogin = loc.pathname === '/login';

  return (
    <div className="min-h-screen relative">
      {/* Ocean animated background */}
      <AnimatedBackground />
      {/* Navigation bar, hidden on login page */}
      {!isLogin && <NavBar />}
      {/* Content layer with padding */}
      <main className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;