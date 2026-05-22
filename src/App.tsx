import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import Bingo from './pages/Bingo';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import EcoVillage from './pages/EcoVillage';
import Events from './pages/Events';
import Learn from './pages/Learn';
import Login from './pages/Login';
import OceanCleanupGame from './pages/OceanCleanupGame';

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
