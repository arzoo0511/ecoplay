import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { 
  TreePine, 
  Sun, 
  Droplets, 
  Leaf, 
  Zap,
  ShoppingCart,
  Plus,
  Sparkles,
  Wind,
  Fish
} from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  icon: React.ComponentType<any>;
  description: string;
  effect: string;
  category: 'plants' | 'energy' | 'water' | 'wildlife';
}

const EcoVillage = () => {
  const { state, dispatch } = useGame();
  const { user, ecoVillage } = state;
  const [selectedCategory, setSelectedCategory] = useState<string>('plants');
  const [showShop, setShowShop] = useState(false);

  const shopItems: ShopItem[] = [
    {
      id: 'tree',
      name: 'Plant Tree',
      cost: 50,
      icon: TreePine,
      description: 'Plant a beautiful tree that grows over time',
      effect: '+5 Air Quality, +3 Biodiversity',
      category: 'plants'
    },
    {
      id: 'flowers',
      name: 'Flower Garden',
      cost: 30,
      icon: Leaf,
      description: 'Colorful flowers that attract butterflies',
      effect: '+2 Biodiversity, +1 Air Quality',
      category: 'plants'
    },
    {
      id: 'solar',
      name: 'Solar Panel',
      cost: 150,
      icon: Sun,
      description: 'Clean energy that reduces pollution',
      effect: '+10 Air Quality, -5 Pollution',
      category: 'energy'
    },
    {
      id: 'wind',
      name: 'Wind Turbine',
      cost: 200,
      icon: Wind,
      description: 'Harness wind power for clean energy',
      effect: '+15 Air Quality, -8 Pollution',
      category: 'energy'
    },
    {
      id: 'water-filter',
      name: 'Water Filter',
      cost: 100,
      icon: Droplets,
      description: 'Purifies water and improves quality',
      effect: '+10 Water Quality, -3 Pollution',
      category: 'water'
    },
    {
      id: 'pond',
      name: 'Wildlife Pond',
      cost: 120,
      icon: Fish,
      description: 'A habitat for fish and aquatic life',
      effect: '+8 Biodiversity, +5 Water Quality',
      category: 'wildlife'
    }
  ];

  const categories = [
    { id: 'plants', name: 'Plants', icon: TreePine, color: 'text-green-400' },
    { id: 'energy', name: 'Energy', icon: Zap, color: 'text-yellow-400' },
    { id: 'water', name: 'Water', icon: Droplets, color: 'text-blue-400' },
    { id: 'wildlife', name: 'Wildlife', icon: Fish, color: 'text-purple-400' }
  ];

  const buyItem = (item: ShopItem) => {
    if (user.points >= item.cost) {
      dispatch({ type: 'ADD_POINTS', payload: -item.cost });
      
      // Update eco village based on item type
      const updates: Partial<typeof ecoVillage> = {};
      
      switch (item.id) {
        case 'tree':
          updates.trees = ecoVillage.trees + 1;
          updates.airQuality = Math.min(100, ecoVillage.airQuality + 5);
          updates.biodiversity = Math.min(100, ecoVillage.biodiversity + 3);
          break;
        case 'flowers':
          updates.airQuality = Math.min(100, ecoVillage.airQuality + 1);
          updates.biodiversity = Math.min(100, ecoVillage.biodiversity + 2);
          break;
        case 'solar':
          updates.solarPanels = ecoVillage.solarPanels + 1;
          updates.airQuality = Math.min(100, ecoVillage.airQuality + 10);
          updates.pollutionLevel = Math.max(0, ecoVillage.pollutionLevel - 5);
          break;
        case 'wind':
          updates.airQuality = Math.min(100, ecoVillage.airQuality + 15);
          updates.pollutionLevel = Math.max(0, ecoVillage.pollutionLevel - 8);
          break;
        case 'water-filter':
          updates.waterFilters = ecoVillage.waterFilters + 1;
          updates.waterQuality = Math.min(100, ecoVillage.waterQuality + 10);
          updates.pollutionLevel = Math.max(0, ecoVillage.pollutionLevel - 3);
          break;
        case 'pond':
          updates.biodiversity = Math.min(100, ecoVillage.biodiversity + 8);
          updates.waterQuality = Math.min(100, ecoVillage.waterQuality + 5);
          break;
      }
      
      dispatch({ type: 'UPDATE_ECO_VILLAGE', payload: updates });
    }
  };

  const getEnvironmentStatus = () => {
    const avgHealth = (ecoVillage.airQuality + ecoVillage.waterQuality + ecoVillage.biodiversity) / 3;
    if (avgHealth >= 80) return { status: 'Thriving', color: 'text-green-400', bg: 'from-green-400/20 to-emerald-600/20' };
    if (avgHealth >= 60) return { status: 'Healthy', color: 'text-blue-400', bg: 'from-blue-400/20 to-cyan-600/20' };
    if (avgHealth >= 40) return { status: 'Recovering', color: 'text-yellow-400', bg: 'from-yellow-400/20 to-orange-600/20' };
    return { status: 'Polluted', color: 'text-red-400', bg: 'from-red-400/20 to-pink-600/20' };
  };

  const envStatus = getEnvironmentStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
          🌱 Your Eco Village
        </h1>
        <p className="text-xl text-blue-100 mb-4">
          Transform your environment and watch it come alive!
        </p>
        <div className={`inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r ${envStatus.bg} border border-white/20`}>
          <Sparkles className={`h-5 w-5 ${envStatus.color} mr-2`} />
          <span className={`font-bold ${envStatus.color}`}>Status: {envStatus.status}</span>
        </div>
      </div>

      {/* Environment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { 
            label: 'Air Quality', 
            value: ecoVillage.airQuality, 
            icon: Wind, 
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-100'
          },
          { 
            label: 'Water Quality', 
            value: ecoVillage.waterQuality, 
            icon: Droplets, 
            color: 'from-blue-400 to-cyan-500',
            bgColor: 'bg-blue-100'
          },
          { 
            label: 'Biodiversity', 
            value: ecoVillage.biodiversity, 
            icon: Leaf, 
            color: 'from-purple-400 to-pink-500',
            bgColor: 'bg-purple-100'
          },
          { 
            label: 'Pollution Level', 
            value: 100 - ecoVillage.pollutionLevel, 
            icon: Sparkles, 
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-100'
          }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{stat.value}%</h3>
              <p className="text-sm text-blue-100">{stat.label}</p>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Village Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Environment View */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-gradient-to-b from-sky-200/20 to-green-300/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 min-h-[500px] relative overflow-hidden"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                linear-gradient(to bottom, rgba(135, 206, 235, 0.1) 0%, rgba(34, 139, 34, 0.1) 100%)
              `
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Environment View</h3>
            
            {/* Trees */}
            <div className="absolute bottom-20 left-10">
              {[...Array(Math.min(ecoVillage.trees, 10))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ 
                    scale: [0.8, 1.2, 1],
                    y: [0, -5, 0]
                  }}
                  transition={{
                    scale: { repeat: Infinity, duration: 3 + i },
                    y: { repeat: Infinity, duration: 2 + i * 0.5 }
                  }}
                  className="absolute text-4xl"
                  style={{
                    left: `${i * 30 + Math.random() * 20}px`,
                    bottom: `${Math.random() * 40}px`
                  }}
                >
                  🌳
                </motion.div>
              ))}
            </div>

            {/* Solar Panels */}
            <div className="absolute top-20 right-10">
              {[...Array(ecoVillage.solarPanels)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4,
                    delay: i * 0.5
                  }}
                  className="absolute text-3xl"
                  style={{
                    right: `${i * 40}px`,
                    top: `${Math.random() * 60}px`
                  }}
                >
                  ☀️
                </motion.div>
              ))}
            </div>

            {/* Water Features */}
            <div className="absolute bottom-10 right-20">
              {[...Array(ecoVillage.waterFilters)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    delay: i * 0.3
                  }}
                  className="absolute text-3xl"
                  style={{
                    right: `${i * 35}px`,
                    bottom: `${Math.random() * 30}px`
                  }}
                >
                  💧
                </motion.div>
              ))}
            </div>

            {/* Wildlife */}
            <div className="absolute inset-0">
              {ecoVillage.wildlife.map((animal, i) => {
                const animals = { fish: '🐠', birds: '🦅', butterflies: '🦋' };
                return (
                  <motion.div
                    key={animal + i}
                    animate={{
                      x: [0, 50, 0, -30, 0],
                      y: [0, -20, 0, -10, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 8 + Math.random() * 4,
                      delay: Math.random() * 3
                    }}
                    className="absolute text-2xl"
                    style={{
                      left: `${Math.random() * 70 + 10}%`,
                      top: `${Math.random() * 60 + 20}%`
                    }}
                  >
                    {animals[animal as keyof typeof animals] || '🐛'}
                  </motion.div>
                );
              })}
            </div>

            {/* Pollution Effects */}
            {ecoVillage.pollutionLevel > 20 && (
              <div className="absolute inset-0 bg-gray-600/20 rounded-2xl">
                {[...Array(Math.floor(ecoVillage.pollutionLevel / 10))].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 2
                    }}
                    className="absolute text-2xl"
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 50 + 25}%`
                    }}
                  >
                    💨
                  </motion.div>
                ))}
              </div>
            )}

            {/* Day/Night Cycle Indicator */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="text-4xl"
              >
                {ecoVillage.airQuality > 50 ? '☀️' : '🌙'}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Points Display */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Your Points</h3>
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-2">{user.points.toLocaleString()}</p>
            <p className="text-sm text-blue-100">Spend points to improve your village!</p>
          </motion.div>

          {/* Village Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Village Assets</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">🌳 Trees</span>
                <span className="font-bold text-white">{ecoVillage.trees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">☀️ Solar Panels</span>
                <span className="font-bold text-white">{ecoVillage.solarPanels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">💧 Water Filters</span>
                <span className="font-bold text-white">{ecoVillage.waterFilters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">🦋 Wildlife Species</span>
                <span className="font-bold text-white">{ecoVillage.wildlife.length}</span>
              </div>
            </div>
          </motion.div>

          {/* Shop Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShop(true)}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
          >
            <ShoppingCart className="h-5 w-5 inline mr-2" />
            Open Eco Shop
          </motion.button>
        </div>
      </div>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowShop(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <ShoppingCart className="h-8 w-8 mr-3 text-green-400" />
                    Eco Shop
                  </h2>
                  <button
                    onClick={() => setShowShop(false)}
                    className="text-white hover:text-red-400 transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-blue-100 mt-2">Upgrade your village with sustainable improvements!</p>
              </div>

              <div className="p-6">
                {/* Category Tabs */}
                <div className="flex space-x-2 mb-6 overflow-x-auto">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                          selectedCategory === category.id
                            ? 'bg-white/20 text-white'
                            : 'text-blue-100 hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${category.color}`} />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Shop Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {shopItems
                    .filter(item => item.category === selectedCategory)
                    .map((item) => {
                      const Icon = item.icon;
                      const canAfford = user.points >= item.cost;

                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            canAfford 
                              ? 'bg-white/5 border-white/20 hover:border-green-400/50' 
                              : 'bg-red-500/10 border-red-400/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{item.name}</h4>
                                <p className="text-sm text-blue-100">{item.cost} points</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-blue-200 mb-2">{item.description}</p>
                          <p className="text-xs text-green-300 mb-4">{item.effect}</p>

                          <button
                            onClick={() => buyItem(item)}
                            disabled={!canAfford}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="h-4 w-4 inline mr-1" />
                            {canAfford ? 'Purchase' : 'Insufficient Points'}
                          </button>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EcoVillage;