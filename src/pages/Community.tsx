import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ThumbsUp, 
  Reply, 
  Share2, 
  Plus,
  Search,
  Award,
  Clock
} from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  isSolved: boolean;
  tags: string[];
}

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'question',
    tags: ''
  });

  const categories = [
    { id: 'all', name: 'All Posts', emoji: '🌟' },
    { id: 'question', name: 'Questions', emoji: '❓' },
    { id: 'tips', name: 'Tips & Advice', emoji: '💡' },
    { id: 'project', name: 'Projects', emoji: '🔨' },
    { id: 'discussion', name: 'Discussion', emoji: '💬' }
  ];

  // Initialize posts as state so actions can update them
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'EcoEnthusiast',
      avatar: '👨‍🌾',
      title: 'Best plants for indoor air purification?',
      content: 'I\'m looking to improve my home\'s air quality naturally. What are the most effective plants for removing toxins and producing oxygen indoors? I have medium to low light conditions.',
      category: 'question',
      timestamp: '2 hours ago',
      likes: 24,
      replies: 8,
      isLiked: false,
      isSolved: false,
      tags: ['plants', 'indoor', 'air-quality']
    },
    {
      id: '2',
      author: 'GreenGuru',
      avatar: '👩‍🔬',
      title: 'DIY Composting System Success Story',
      content: 'Just wanted to share my homemade composting system that\'s been working amazingly for 6 months! Used recycled materials and it\'s producing rich soil for my garden. Happy to share the blueprint if anyone\'s interested.',
      category: 'project',
      timestamp: '5 hours ago',
      likes: 42,
      replies: 15,
      isLiked: true,
      isSolved: false,
      tags: ['composting', 'DIY', 'recycling']
    },
    {
      id: '3',
      author: 'SolarSaver',
      avatar: '🔌',
      title: 'Solar panel installation - permit process?',
      content: 'I\'m planning to install solar panels on my roof but I\'m confused about the permit process. Does anyone have experience with residential solar installation permits? What documents do I need?',
      category: 'question',
      timestamp: '1 day ago',
      likes: 18,
      replies: 12,
      isLiked: false,
      isSolved: true,
      tags: ['solar', 'permits', 'installation']
    },
    {
      id: '4',
      author: 'ZeroWasteZara',
      avatar: '♻️',
      title: 'Zero waste grocery shopping tips',
      content: 'After 2 years of zero-waste living, here are my top tips for plastic-free grocery shopping: bring your own containers, shop at farmers markets, buy in bulk, and don\'t forget mesh produce bags!',
      category: 'tips',
      timestamp: '1 day ago',
      likes: 67,
      replies: 23,
      isLiked: true,
      isSolved: false,
      tags: ['zero-waste', 'shopping', 'plastic-free']
    },
    {
      id: '5',
      author: 'ClimateConscious',
      avatar: '🌡️',
      title: 'Local climate action groups - how to find and join?',
      content: 'I want to get more involved in climate activism in my community. How do I find local environmental groups? What should I expect when joining? Any tips for someone who\'s new to activism?',
      category: 'discussion',
      timestamp: '2 days ago',
      likes: 31,
      replies: 19,
      isLiked: false,
      isSolved: false,
      tags: ['activism', 'community', 'climate-action']
    }
  ]);

  // Reply modal state
  const [replyModal, setReplyModal] = useState<{ open: boolean; postId?: string }>({ open: false });
  const [replyText, setReplyText] = useState('');

  // Like handler
  const handleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  // Share handler
  const handleShare = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const url = `${window.location.origin}/community/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: 'Check this out on Eco Community', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Post link copied to clipboard');
      }
    } catch {
      // ignore
    }
  };

  // Open reply
  const openReply = (id: string) => setReplyModal({ open: true, postId: id });

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal.postId || !replyText.trim()) return;
    setPosts(prev =>
      prev.map(p => (p.id === replyModal.postId ? { ...p, replies: p.replies + 1 } : p))
    );
    setReplyText('');
    setReplyModal({ open: false });
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'tips': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'project': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      case 'discussion': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    setPosts(prev => [
      {
        id,
        author: 'You',
        avatar: '👤',
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        timestamp: 'Just now',
        likes: 0,
        replies: 0,
        isLiked: false,
        isSolved: false,
        tags: newPost.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      },
      ...prev
    ]);
    setShowNewPost(false);
    setNewPost({ title: '', content: '', category: 'question', tags: '' });
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
          🌱 Eco Community
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Connect with fellow environmental enthusiasts. Ask questions, share solutions, and collaborate on sustainable projects.
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Members', value: '2.4K', color: 'text-green-400' },
          { label: 'Posts Today', value: '47', color: 'text-blue-400' },
          { label: 'Solved Questions', value: '156', color: 'text-purple-400' },
          { label: 'Projects Shared', value: '89', color: 'text-orange-400' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20"
          >
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-blue-100">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
            <input
              type="text"
              placeholder="Search posts, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewPost(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            New Post
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{post.avatar}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white">{post.author}</h3>
                    {post.isSolved && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        Solved
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-blue-300">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.timestamp}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getCategoryColor(post.category)}`}>
                {categories.find(c => c.id === post.category)?.name}
              </div>
            </div>

            {/* Post Content */}
            <h2 className="text-xl font-bold text-white mb-3">{post.title}</h2>
            <p className="text-blue-100 mb-4 leading-relaxed">{post.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 text-blue-200 px-2 py-1 rounded-lg text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    post.isLiked 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-white/10 text-blue-100 hover:bg-white/20'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openReply(post.id)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 text-blue-100 hover:bg-white/20 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{post.replies}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 text-blue-100 hover:bg-white/20 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Share</span>
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openReply(post.id)}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
              >
                <Reply className="h-4 w-4 inline mr-2" />
                Reply
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Post</h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="text-white hover:text-red-400 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
                    placeholder="What's your question or topic?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="question">Question</option>
                    <option value="tips">Tips & Advice</option>
                    <option value="project">Project</option>
                    <option value="discussion">Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 h-32 resize-none"
                    placeholder="Share your thoughts, questions, or project details..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
                    placeholder="e.g., recycling, solar-energy, composting"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
                  >
                    Post to Community
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewPost(false)}
                    className="bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModal.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setReplyModal({ open: false })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Add a reply</h3>
                <button className="text-white text-2xl" onClick={() => setReplyModal({ open: false })}>×</button>
              </div>
              <form onSubmit={submitReply} className="space-y-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 h-28 resize-none"
                  placeholder="Write your reply..."
                  required
                />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all">
                    Post Reply
                  </button>
                  <button type="button" onClick={() => setReplyModal({ open: false })} className="bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Guidelines */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-300/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">💚 Community Guidelines</h2>
        <div className="grid md:grid-cols-3 gap-4 text-blue-100">
          <div>
            <h3 className="font-bold text-white mb-2">Be Respectful</h3>
            <p className="text-sm">Treat all community members with kindness and respect.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">Share Knowledge</h3>
            <p className="text-sm">Help others by sharing your environmental expertise and experiences.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">Stay On Topic</h3>
            <p className="text-sm">Keep discussions focused on environmental and sustainability topics.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Community;