import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ConfigErrorScreen from './components/status/ConfigErrorScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import { validateEnv } from './config/validateEnv';
import Layout from './components/Layout';
import useSyncStatus from './hooks/useSyncStatus';
import MergePrompt from './components/status/MergePrompt';
import OfflineBanner from './components/status/OfflineBanner';

import Auth from './pages/Auth';

const Bingo            = lazy(() => import('./pages/Bingo'));
const Community        = lazy(() => import('./pages/Community'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const EcoVillage       = lazy(() => import('./pages/EcoVillage'));
const Events           = lazy(() => import('./pages/Events'));
const LandingPage      = lazy(() => import('./pages/LandingPage'));
const Learn            = lazy(() => import('./pages/Learn'));
const OceanCleanupGame = lazy(() => import('./pages/OceanCleanupGame'));

/** Shown while a lazy-loaded route chunk is being fetched. */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-green-600 font-semibold text-xl">Loading...</div>
  </div>
);

/** Catches dynamic-import failures and shows a friendly message. */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600 font-semibold text-xl">
            Something went wrong while loading this page. Please refresh and try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Wraps a lazy route element in a per-route ErrorBoundary + Suspense pair.
 * This means each route gets its own loading fallback and error isolation.
 */
const withLazyBoundary = (element: React.ReactNode) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {element}
    </Suspense>
  </ErrorBoundary>
);

/**
 * Protects routes that require authentication.
 * Shows a loading indicator while the Supabase session is being restored
 * to prevent a flash of redirect on page refresh.
 */
const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!user && !isGuest) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};
const AppRoutes = () => {
    const { supabaseError } = useAuth();
    const { pendingCount, isSyncing } = useSyncStatus();
    const bannerMessage = `${supabaseError ?? ''}${isSyncing ? ' Syncing...' : ''}`;

    return (
      <>
        <OfflineBanner
          visible={!!supabaseError}
          message={bannerMessage}
          pendingCount={pendingCount}
        />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={withLazyBoundary(<LandingPage />)} />
            <Route path="/login" element={<Auth />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={withLazyBoundary(<Protected><Dashboard /></Protected>)} />
            <Route path="/ocean-cleanup-game" element={withLazyBoundary(<Protected><OceanCleanupGame /></Protected>)} />
            <Route path="/eco-village" element={withLazyBoundary(<Protected><EcoVillage /></Protected>)} />
            <Route path="/learn" element={withLazyBoundary(<Protected><Learn /></Protected>)} />
            <Route path="/bingo" element={withLazyBoundary(<Protected><Bingo /></Protected>)} />
            <Route path="/community" element={withLazyBoundary(<Protected><Community /></Protected>)} />
            <Route path="/events" element={withLazyBoundary(<Protected><Events /></Protected>)} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </>
    );
  };

export default function App() {
  const envStatus = validateEnv();

  if (!envStatus.valid) {
    return <ConfigErrorScreen missing={envStatus.missing} />;
  }

  

  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <MergePrompt />
          <AppRoutes />
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
