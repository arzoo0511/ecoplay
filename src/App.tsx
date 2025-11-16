import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import EcoChatbot from './components/EcoChatbot';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import OceanCleanupGame from './pages/OceanCleanupGame';
import EcoVillage from './pages/EcoVillage';
import Learn from './pages/Learn';
import Events from './pages/Events';
import Community from './pages/Community';
import { GameProvider } from './context/GameContext';
import AnimatedBackground from './components/AnimatedBackground';
import Bingo from './pages/Bingo';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen relative overflow-hidden">
          <AnimatedBackground />
          <Navbar />
          <main className="relative z-10 pt-16">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/ocean-cleanup" element={<OceanCleanupGame />} />
                <Route path="/eco-village" element={<EcoVillage />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/events" element={<Events />} />
                <Route path="/community" element={<Community />} />
                <Route path="/bingo" element={<Bingo />} />




              </Routes>
            </AnimatePresence>
          </main>
          <EcoChatbot />
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;