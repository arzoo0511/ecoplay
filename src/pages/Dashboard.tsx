import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { 
  Zap, 
  Droplets, 
  TreePine, 
  Award, 
  Target, 
  TrendingUp,
  Fish,
  Leaf,
  Sun
} from 'lucide-react';

const Dashboard = () => {
  const { state } = useGame();
  const { user, ecoVillage, dailyChallenges, gameStats } = state;

  const stats = [
    {
      icon: Zap,
      label: 'Total Points',
      value: user.points.toLocaleString(),
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: TreePine,
      label: 'Eco Score',
      value: `${user.ecoScore}%`,
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Droplets,
      label: 'Water Quality',
      value: `${ecoVillage.waterQuality}%`,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Fish,
      label: 'Ocean Cleanups',
      value: gameStats.perfectCleanups.toString(),
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-100'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 sm:p-6 lg:p-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
          Welcome back, <span className="text-green-400">{user.name}!</span>
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Your environmental impact grows stronger every day. Continue your mission to save our planet!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-blue-100 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environment Status */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Leaf className="h-6 w-6 text-green-400 mr-2" />
            Environment Health
          </h2>
          
          <div className="space-y-4">
            {[
              { label: 'Air Quality', value: ecoVillage.airQuality, color: 'bg-green-400' },
              { label: 'Water Quality', value: ecoVillage.waterQuality, color: 'bg-blue-400' },
              { label: 'Biodiversity', value: ecoVillage.biodiversity, color: 'bg-purple-400' },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>{metric.label}</span>
                  <span className="font-bold">{metric.value}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${metric.color} rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="text-white">
              <TreePine className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="font-bold text-xl">{ecoVillage.trees}</p>
              <p className="text-sm text-blue-100">Trees Planted</p>
            </div>
            <div className="text-white">
              <Sun className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-bold text-xl">{ecoVillage.solarPanels}</p>
              <p className="text-sm text-blue-100">Solar Panels</p>
            </div>
            <div className="text-white">
              <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="font-bold text-xl">{ecoVillage.waterFilters}</p>
              <p className="text-sm text-blue-100">Water Filters</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Challenges */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="h-6 w-6 text-orange-400 mr-2" />
            Daily Challenges
          </h2>
          
          <div className="space-y-4">
            {dailyChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  challenge.completed 
                    ? 'bg-green-500/20 border-green-400' 
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{challenge.title}</h3>
                  <div className="flex items-center text-yellow-400">
                    <Award className="h-4 w-4 mr-1" />
                    <span className="text-sm font-bold">{challenge.points}</span>
                  </div>
                </div>
                <p className="text-blue-100 text-sm mb-3">{challenge.description}</p>
                
                {challenge.completed ? (
                  <div className="flex items-center text-green-400 font-medium">
                    <Award className="h-4 w-4 mr-2" />
                    Completed!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress}%` }}
                        className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-blue-200">{challenge.progress}% Complete</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
          >
            <TrendingUp className="h-5 w-5 inline mr-2" />
            View All Challenges
          </motion.button>
        </motion.div>
      </div>

      {/* Fun Facts Section */}
      <motion.div
        variants={itemVariants}
        className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">🌟 Eco Fact of the Day</h2>
        <p className="text-lg text-white/90">
          A single tree can absorb up to 48 pounds of CO₂ per year and produce enough oxygen for two people to breathe! 
          Your {ecoVillage.trees} trees are making a real difference! 🌳
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;