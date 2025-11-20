import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { 
  Play, 
  Trophy, 
  Zap,
  Target,
  Clock,
  Star
} from 'lucide-react';

interface TrashItem {
  id: string;
  x: number;
  y: number;
  type: 'bottle' | 'can' | 'bag' | 'tire' | 'oil';
  points: number;
  size: number;
}

interface Fish {
  id: string;
  x: number;
  y: number;
  speed: number;
  direction: number;
}

const OceanCleanupGame = () => {
  const { state, dispatch } = useGame();
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // CHANGED: 30 seconds
  const [level, setLevel] = useState(1);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalCollected, setTotalCollected] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const trashTypes = {
    bottle: { points: 10, color: 'bg-blue-400', emoji: '🍶' },
    can: { points: 15, color: 'bg-gray-400', emoji: '🥤' },
    bag: { points: 20, color: 'bg-green-400', emoji: '🛍️' },
    tire: { points: 50, color: 'bg-black', emoji: '🛞' },
    oil: { points: 100, color: 'bg-yellow-600', emoji: '🛢️' }
  };

  // Generate single trash item
  const generateSingleTrash = useCallback(() => {
    const types = Object.keys(trashTypes) as (keyof typeof trashTypes)[];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: `trash-${Date.now()}-${Math.random()}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15,
      type,
      points: trashTypes[type].points,
      size: type === 'tire' ? 40 : type === 'oil' ? 35 : 25,
    };
  }, []);

  // Generate initial trash
  const generateInitialTrash = useCallback(() => {
    const newTrash: TrashItem[] = [];
    const trashCount = 10 + (level * 3); // More trash per level
    
    for (let i = 0; i < trashCount; i++) {
      newTrash.push(generateSingleTrash());
    }
    
    setTrash(newTrash);
  }, [level, generateSingleTrash]);

  // Generate fish obstacles
  const generateFish = useCallback(() => {
    const newFish: Fish[] = [];
    const fishCount = 3 + Math.floor(level / 2); // More fish at higher levels
    
    for (let i = 0; i < fishCount; i++) {
      newFish.push({
        id: `fish-${i}`,
        x: Math.random() * 100,
        y: 20 + Math.random() * 60,
        speed: 1 + Math.random() * 2,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    
    setFish(newFish);
  }, [level]);

  const startGame = () => {
    setGameActive(true);
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30); // CHANGED: 30 seconds
    setCombo(0);
    setTotalCollected(0);
    generateInitialTrash();
    generateFish();
  };

  const collectTrash = (trashId: string) => {
    if (!gameActive) return;

    const trashItem = trash.find(item => item.id === trashId);
    if (trashItem) {
      // Remove collected trash
      setTrash(prev => prev.filter(item => item.id !== trashId));
      
      // Add new trash to replace it
      setTrash(prev => [...prev, generateSingleTrash()]);

      const points = trashItem.points * (1 + combo * 0.1);
      setScore(prev => prev + Math.round(points));
      setCombo(prev => prev + 1);
      setTotalCollected(prev => prev + 1);
      setShowCombo(true);
      
      setTimeout(() => setShowCombo(false), 1000);
      
      dispatch({ type: 'ADD_POINTS', payload: Math.round(points) });
    }
  };

  const handleFishCollision = useCallback(() => {
    if (!gameActive) return;
    
    setScore(prev => Math.max(0, prev - 5));
    setCombo(0);
    
    // Visual feedback
    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.style.border = '3px solid red';
      setTimeout(() => {
        gameArea.style.border = '';
      }, 200);
    }
  }, [gameActive]);

  // Track mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    mousePos.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  // Fish movement and collision detection
  useEffect(() => {
    if (!gameActive) return;

    const fishInterval = setInterval(() => {
      setFish(prev => prev.map(f => {
        let newX = f.x + (f.speed * f.direction * 0.5);
        let newDirection = f.direction;
        
        // Bounce off edges
        if (newX > 95 || newX < 5) {
          newDirection = -f.direction;
          newX = f.x + (f.speed * newDirection * 0.5);
        }

        // Check collision with cursor
        const dx = Math.abs(mousePos.current.x - newX);
        const dy = Math.abs(mousePos.current.y - f.y);
        
        if (dx < 5 && dy < 5) {
          handleFishCollision();
        }

        return {
          ...f,
          x: newX,
          direction: newDirection
        };
      }));
    }, 50);

    return () => clearInterval(fishInterval);
  }, [gameActive, handleFishCollision]);

  const endGame = useCallback(() => {
    setGameActive(false);
    
    dispatch({
      type: 'UPDATE_OCEAN_STATS',
      payload: {
        oceanCleanupScore: (state.gameStats?.oceanCleanupScore || 0) + score,
        totalTrashCollected: (state.gameStats?.totalTrashCollected || 0) + totalCollected,
        perfectCleanups: state.gameStats?.perfectCleanups || 0
      }
    });

    if (score > 500) {
      setLevel(prev => prev + 1);
    }
  }, [dispatch, score, totalCollected, state.gameStats]);

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, endGame]);

  useEffect(() => {
    if (combo > 0 && combo % 5 === 0) {
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 2000);
    }
    
    const comboTimer = setTimeout(() => {
      if (combo > 0) {
        setCombo(0);
      }
    }, 3000);
    
    return () => clearTimeout(comboTimer);
  }, [combo]);

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8"
    >
      <div className="mb-6 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
          🌊 Ocean Cleanup Challenge
        </h1>
        <p className="text-xl text-blue-100">
          Clean the ocean! Avoid the fish and collect trash. New trash spawns continuously!
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { icon: Trophy, label: 'Score', value: score.toLocaleString(), color: 'text-yellow-400' },
          { icon: Clock, label: 'Time', value: formatTime(timeLeft), color: 'text-blue-400' },
          { icon: Target, label: 'Level', value: level.toString(), color: 'text-green-400' },
          { icon: Star, label: 'Combo', value: `x${combo}`, color: 'text-purple-400' },
          { icon: Zap, label: 'Collected', value: totalCollected.toString(), color: 'text-orange-400' }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20"
            >
              <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-blue-100">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="relative">
        {!gameActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {gameStarted ? 'Game Complete!' : 'Ready to Clean the Ocean?'}
              </h2>
              {gameStarted && (
                <div className="mb-6 p-6 bg-white/10 rounded-xl backdrop-blur-lg">
                  <p className="text-xl text-white mb-2">Final Score: <span className="font-bold text-yellow-400">{score.toLocaleString()}</span></p>
                  <p className="text-lg text-blue-100">Trash Collected: {totalCollected}</p>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-green-600 hover:to-blue-600 transition-all"
              >
                <Play className="h-6 w-6 inline mr-2" />
                {gameStarted ? 'Play Again' : 'Start Game'}
              </motion.button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showCombo && combo >= 5 && (
            <motion.div
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -50 }}
              className="absolute top-10 left-1/2 transform -translate-x-1/2 z-30"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-6 rounded-full text-xl">
                🔥 {combo}x COMBO!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={gameAreaRef}
          onMouseMove={handleMouseMove}
          className="bg-gradient-to-b from-blue-400/30 to-blue-900/50 backdrop-blur-lg rounded-2xl border-2 border-blue-300/30 min-h-[600px] relative overflow-hidden transition-all"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
          }}
        >
          {/* Fish Obstacles */}
          {gameActive && fish.map((f) => (
            <motion.div
              key={f.id}
              className="absolute text-4xl pointer-events-none z-10"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: f.direction > 0 ? 'scaleX(1)' : 'scaleX(-1)'
              }}
            >
              🐠
            </motion.div>
          ))}

          {/* Trash Items */}
          <AnimatePresence>
            {trash.map((item) => {
              const trashStyle = trashTypes[item.type];
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: [0, 10, -10, 0],
                    y: [0, -5, 5, 0]
                  }}
                  exit={{ 
                    scale: 0, 
                    rotate: 360,
                    transition: { duration: 0.5 }
                  }}
                  transition={{
                    rotate: { repeat: Infinity, duration: 3 + Math.random() * 2 },
                    y: { repeat: Infinity, duration: 2 + Math.random() }
                  }}
                  className="absolute cursor-pointer transform hover:scale-110 transition-transform z-20"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.size}px`,
                    height: `${item.size}px`
                  }}
                  onClick={() => collectTrash(item.id)}
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`w-full h-full ${trashStyle.color} rounded-lg flex items-center justify-center text-2xl shadow-lg border-2 border-white/30`}>
                    {trashStyle.emoji}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    {item.points}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Bubbles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              animate={{
                y: [-10, -50, -10],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${80 + Math.random() * 20}%`
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-bold text-white mb-4">🎮 How to Play</h3>
        <div className="grid md:grid-cols-2 gap-4 text-blue-100">
          <div>
            <p className="mb-2"><strong>⚠️ Avoid Fish:</strong> Touching fish = -5 points!</p>
            <p className="mb-2"><strong>🗑️ Click Trash:</strong> Collect continuously spawning trash</p>
            <p><strong>🔥 Combos:</strong> Collect quickly for multipliers</p>
          </div>
          <div>
            <p className="mb-2"><strong>⏱️ Time:</strong> 30 seconds per round</p>
            <p className="mb-2"><strong>📈 Level Up:</strong> Score 500+ to advance</p>
            <p><strong>♻️ Endless Trash:</strong> New trash spawns when collected!</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OceanCleanupGame;