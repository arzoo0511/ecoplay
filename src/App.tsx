import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Lazy load the heavy page components to split the JS bundle
const Auth = lazy(() => import('./pages/Auth'));
const Bingo = lazy(() => import('./pages/Bingo'));
const Community = lazy(() => import('./pages/Community'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EcoVillage = lazy(() => import('./pages/EcoVillage'));
const Events = lazy(() => import('./pages/Events'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Learn = lazy(() => import('./pages/Learn'));
const OceanCleanupGame = lazy(() => import('./pages/OceanCleanupGame'));

/**
 * Protects routes that require authentication.
 * Shows a loading indicator while the Supabase session is being restored
 * to prevent a flash of redirect on page refresh.
 */
const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

// Shared loading fallback for lazy-loaded chunks
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-white text-xl">
    Loading...
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <BrowserRouter>
            {/* Suspense boundary manages the loading state while chunks are fetched over the network */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/ocean-cleanup-game" element={<Protected><OceanCleanupGame /></Protected>} />
                <Route path="/eco-village" element={<Protected><EcoVillage /></Protected>} />
                <Route path="/learn" element={<Protected><Learn /></Protected>} />
                <Route path="/bingo" element={<Protected><Bingo /></Protected>} />
                <Route path="/community" element={<Protected><Community /></Protected>} />
                <Route path="/events" element={<Protected><Events /></Protected>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}