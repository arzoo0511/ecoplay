import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  ExternalLink, 
  Award, 
  Clock,
  Users,
  Star,
  Search
} from 'lucide-react';

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
}

const Learn = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      category: 'climate'
    },
    {
      id: '2',
      title: 'Ocean Plastic Pollution Crisis',
      description: 'Explore the impact of plastic waste on marine ecosystems.',
      type: 'interactive',
      duration: '20 min',
      difficulty: 'Intermediate',
      rating: 4.9,
      thumbnail: 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg',
      category: 'ocean'
    },
    {
      id: '3',
      title: 'Solar Energy Fundamentals',
      description: 'Discover how solar power works and its environmental benefits.',
      type: 'video',
      duration: '12 min',
      difficulty: 'Beginner',
      rating: 4.7,
      thumbnail: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
      category: 'renewable'
    },
    {
      id: '4',
      title: 'Protecting Endangered Species',
      description: 'Learn about conservation efforts to protect wildlife.',
      type: 'article',
      duration: '10 min',
      difficulty: 'Intermediate',
      rating: 4.6,
      thumbnail: 'https://images.pexels.com/photos/247937/pexels-photo-247937.jpeg',
      category: 'biodiversity'
    },
    {
      id: '5',
      title: 'Sustainable Living Practices',
      description: 'Practical tips for reducing your environmental footprint.',
      type: 'interactive',
      duration: '25 min',
      difficulty: 'Beginner',
      rating: 4.8,
      thumbnail: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg',
      category: 'sustainability'
    },
    {
      id: '6',
      title: 'Wind Power Technology',
      description: 'Explore how wind turbines generate clean energy.',
      type: 'video',
      duration: '18 min',
      difficulty: 'Advanced',
      rating: 4.5,
      thumbnail: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg',
      category: 'renewable'
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
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 group cursor-pointer"
            >
              <div className="relative h-48">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(content.difficulty)}`}>
                    {content.difficulty}
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                  {getTypeIcon(content.type)}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-3">{content.duration}</span>
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{content.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-blue-100 mb-4">{content.description}</p>
                <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all inline-flex items-center">
                  {content.type === 'video' ? 'Watch Now' : content.type === 'interactive' ? 'Start Learning' : 'Read Article'}
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
              className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 group cursor-pointer"
            >
              <div className="relative h-40">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 left-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(content.difficulty)}`}>
                    {content.difficulty}
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                  {getTypeIcon(content.type)}
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="mr-2">{content.duration}</span>
                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                    <span>{content.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-2 line-clamp-2">{content.title}</h3>
                <p className="text-sm text-blue-100 mb-4 line-clamp-2">{content.description}</p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all text-sm">
                  Start Learning
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
            <div className="text-3xl font-bold text-green-400 mb-2">12</div>
            <p className="text-blue-100">Courses Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4.8</div>
            <p className="text-blue-100">Average Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">320</div>
            <p className="text-blue-100">Learning Points Earned</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Learn;