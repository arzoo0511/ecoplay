import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OceanCleanupGame from './pages/OceanCleanupGame';
import EcoVillage from './pages/EcoVillage';
import Learn from './pages/Learn';
import Bingo from './pages/Bingo';
import Community from './pages/Community';
import Events from './pages/Events';

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/ocean-cleanup-game" element={<Protected><OceanCleanupGame /></Protected>} />
            <Route path="/eco-village" element={<Protected><EcoVillage /></Protected>} />
            <Route path="/learn" element={<Protected><Learn /></Protected>} />
            <Route path="/bingo" element={<Protected><Bingo /></Protected>} />
            <Route path="/community" element={<Protected><Community /></Protected>} />
            <Route path="/events" element={<Protected><Events /></Protected>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}