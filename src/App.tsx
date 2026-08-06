import React, { Suspense } from 'react';
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
import Navbar from './components/Navbar';
import Login from './pages/Login';

const Bingo = React.lazy(() => import('./pages/Bingo'));
const Community = React.lazy(() => import('./pages/Community'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const EcoVillage = React.lazy(() => import('./pages/EcoVillage'));
const Events = React.lazy(() => import('./pages/Events'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Learn = React.lazy(() => import('./pages/Learn'));
const OceanCleanupGame = React.lazy(() => import('./pages/OceanCleanupGame'));
const Journey = React.lazy(() => import('./pages/Journey'));
const QuizGame = React.lazy(() => import('./pages/Quizgame').then(m => ({ default: m.QuizGame })));
.catch(err => console.error(err))