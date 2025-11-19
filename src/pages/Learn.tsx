import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  ExternalLink, 
  Award, 
  Clock,
  Users,
  Star,
  Search,
  CheckCircle,
  X
} from 'lucide-react';
import { useGame } from '../context/GameContext';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'interactive';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  thumbnail: string;
  category: string;
  completed?: boolean;
  points?: number;
  url: string; // ADD
}

const Learn = () => {
  const { dispatch } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set()); // ADD: track opened resources

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'climate', name: 'Climate Change' },
    { id: 'ocean', name: 'Ocean Conservation' },
    { id: 'renewable', name: 'Renewable Energy' },
    { id: 'biodiversity', name: 'Biodiversity' },
    { id: 'sustainability', name: 'Sustainability' }
  ];

  const learningContent: LearningContent[] = [
    {
      id: '1',
      title: 'Understanding Climate Change',
      description: 'Learn about the science behind climate change and its global impacts.',
      type: 'video',
      duration: '15 min',
      difficulty: 'Beginner',
      rating: 4.8,
      thumbnail: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
      category: 'climate',
      points: 50,
      url: 'https://www.youtube.com/watch?v=G4H1N_yXBiA' // National Geographic – Global Warming 101
    },
    {
      id: '2',
      title: 'Ocean Plastic Pollution Crisis',
      description: 'Explore the impact of plastic waste on marine ecosystems and what we can do.',
      type: 'video',
      duration: '20 min',
      difficulty: 'Intermediate',
      rating: 4.9,
      thumbnail: 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg',
      category: 'ocean',
      points: 75,
      url: 'https://www.youtube.com/watch?v=ROW9F-c0kIQ' // The Ocean Cleanup – Boyan Slat TEDx
    },
    {
      id: '3',
      title: 'Solar Energy Fundamentals',
      description: 'How solar panels work and their environmental benefits.',
      type: 'video',
      duration: '12 min',
      difficulty: 'Beginner',
      rating: 4.7,
      thumbnail: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
      category: 'renewable',
      points: 50,
      url: 'https://www.youtube.com/watch?v=xKxrkht7CpY' // TED-Ed – How do solar panels work?
    },
    {
      id: '4',
      title: 'Protecting Endangered Species',
      description: 'Conservation efforts and restoration programs around the world.',
      type: 'article',
      duration: '10 min',
      difficulty: 'Intermediate',
      rating: 4.6,
      thumbnail: 'https://images.pexels.com/photos/247937/pexels-photo-247937.jpeg',
      category: 'biodiversity',
      points: 60,
      url: 'https://www.nationalgeographic.com/animals/article/endangered-species'
    },
    {
      id: '5',
      title: 'Sustainable Living Practices',
      description: 'Calculate your footprint and build a personal action plan.',
      type: 'interactive',
      duration: '25 min',
      difficulty: 'Beginner',
      rating: 4.8,
      thumbnail: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg',
      category: 'sustainability',
      points: 80,
      url: 'https://www.footprintcalculator.org/' // Global Footprint Network
    },
    {
      id: '6',
      title: 'Wind Power Technology',
      description: 'How wind turbines generate clean energy.',
      type: 'article',
      duration: '18 min',
      difficulty: 'Advanced',
      rating: 4.5,
      thumbnail: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg',
      category: 'renewable',
      points: 100,
      url: 'https://www.energy.gov/eere/wind/how-do-wind-turbines-work' // U.S. DOE
    }
  ];

  const filteredContent = learningContent.filter(content => {
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'interactive': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'Advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  const hostFromUrl = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
  };

  const openContent = (content: LearningContent) => {
    setSelectedContent(content);
  };

  const openResource = (content: LearningContent) => {
    window.open(content.url, '_blank', 'noopener,noreferrer');
    setOpenedIds(prev => new Set(prev).add(content.id));
  };

  const completeContent = () => {
    if (!selectedContent) return;
    if (!openedIds.has(selectedContent.id)) return; // guard: must open first
    if (!completedIds.has(selectedContent.id)) {
      setCompletedIds(prev => new Set(prev).add(selectedContent.id));
      dispatch({ type: 'ADD_POINTS', payload: selectedContent.points || 50 });
    }
    setSelectedContent(null);
  };

  const completedCount = completedIds.size;
  const totalPoints = Array.from(completedIds).reduce((sum, id) => {
    const content = learningContent.find(c => c.id === id);
    return sum + (content?.points || 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
          🎓 Environmental Learning Center
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Expand your knowledge about environmental science, sustainability, and conservation through curated educational content.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
          <input
            type="text"
            placeholder="Search learning content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Star className="h-6 w-6 text-yellow-400 mr-2" />
          Featured Content
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContent.slice(0, 2).map((content) => (
            <motion.div
              key={content.id}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => openContent(content)}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 group cursor-pointer"
            >
              <div className="relative h-48">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {completedIds.has(content.id) && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Completed
                  </div>
                )}
                <div className={`absolute ${completedIds.has(content.id) ? 'top-4 right-4' : 'top-4 left-4'}`}>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(content.difficulty)}`}>
                    {content.difficulty}
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white">
                  {getTypeIcon(content.type)}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-3">{content.duration}</span>
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{content.rating}</span>
                    <span className="ml-auto text-xs bg-black/40 rounded-full px-2 py-0.5">
                      {hostFromUrl(content.url)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 mb-4">{content.description}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); openResource(content); }}
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all inline-flex items-center"
                >
                  {content.type === 'video' ? 'Watch on YouTube' : content.type === 'interactive' ? 'Open Interactive' : 'Read Article'}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Content Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">All Learning Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content) => (
            <motion.div
              key={content.id}
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={() => openContent(content)}
              className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 group cursor-pointer"
            >
              <div className="relative h-40">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {completedIds.has(content.id) && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white p-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
                <div className={`absolute top-2 ${completedIds.has(content.id) ? 'left-10' : 'left-2'}`}>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(content.difficulty)}`}>
                    {content.difficulty}
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 text-white">
                  {getTypeIcon(content.type)}
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="mr-2">{content.duration}</span>
                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                    <span>{content.rating}</span>
                    <span className="ml-auto text-[10px] bg-black/40 rounded-full px-2 py-0.5">
                      {hostFromUrl(content.url)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-2 line-clamp-2">{content.title}</h3>
                <p className="text-sm text-blue-100 mb-4 line-clamp-2">{content.description}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); openResource(content); }}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all text-sm"
                >
                  {content.type === 'video' ? 'Watch on YouTube' : content.type === 'interactive' ? 'Open Interactive' : 'Read Article'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-300/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Award className="h-6 w-6 text-yellow-400 mr-2" />
          Your Learning Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{completedCount}</div>
            <p className="text-blue-100">Courses Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4.8</div>
            <p className="text-blue-100">Average Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{totalPoints}</div>
            <p className="text-blue-100">Learning Points Earned</p>
          </div>
        </div>
      </motion.div>

      {/* Content Detail Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img src={selectedContent.thumbnail} alt={selectedContent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70"
                  onClick={() => setSelectedContent(null)}
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(selectedContent.difficulty)}`}>
                      {selectedContent.difficulty}
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      {getTypeIcon(selectedContent.type)}
                      <span className="ml-1 capitalize">{selectedContent.type}</span>
                    </div>
                    <div className="ml-auto text-xs bg-black/40 text-white px-2 py-1 rounded-full">
                      {hostFromUrl(selectedContent.url)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{selectedContent.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-blue-200 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-3">{selectedContent.duration}</span>
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{selectedContent.rating}</span>
                  </div>
                  <div className="text-yellow-400 font-bold">+{selectedContent.points} pts</div>
                </div>
                <p className="text-blue-100 mb-6">{selectedContent.description}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => openResource(selectedContent)}
                    className="bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition-all inline-flex items-center"
                  >
                    Open Resource
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </button>
                  <button
                    disabled={!openedIds.has(selectedContent.id)}
                    onClick={completeContent}
                    className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all ${
                      openedIds.has(selectedContent.id)
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                        : 'bg-white/10 text-white/60 cursor-not-allowed'
                    }`}
                    title={openedIds.has(selectedContent.id) ? '' : 'Open the resource first'}
                  >
                    {openedIds.has(selectedContent.id) ? `Complete & Earn ${selectedContent.points} Points` : 'Complete (open resource first)'}
                  </button>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Learn;