import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Clock, MessageCircle, Plus, Reply, Search, Share2, ThumbsUp } from 'lucide-react';
import {
  chipBase,
  glassCard,
  inputClass,
  modalBackdrop,
  modalPanel,
  pageShell,
  pageSubtitle,
  pageTitle,
  primaryButton,
  secondaryButton,
  softCard,
} from '../lib/ui';

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
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'EcoEnthusiast',
      avatar: 'EE',
      title: 'Best plants for indoor air purification?',
      content:
        "I'm looking to improve my home's air quality naturally. What are the most effective plants for removing toxins and producing oxygen indoors? I have medium to low light conditions.",
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
      avatar: 'GG',
      title: 'DIY composting system success story',
      content:
        "Just wanted to share my homemade composting system that's been working amazingly for 6 months. Used recycled materials and it's producing rich soil for my garden. Happy to share the blueprint if anyone's interested.",
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
      avatar: 'SS',
      title: 'Solar panel installation permit process?',
      content:
        "I'm planning to install solar panels on my roof but I'm confused about the permit process. Does anyone have experience with residential solar installation permits? What documents do I need?",
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
      avatar: 'ZZ',
      title: 'Zero-waste grocery shopping tips',
      content:
        "After 2 years of zero-waste living, here are my top tips for plastic-free grocery shopping: bring your own containers, shop at farmers markets, buy in bulk, and don't forget mesh produce bags.",
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
      avatar: 'CC',
      title: 'Local climate action groups: how to find and join?',
      content:
        "I want to get more involved in climate activism in my community. How do I find local environmental groups? What should I expect when joining? Any tips for someone who's new to activism?",
      category: 'discussion',
      timestamp: '2 days ago',
      likes: 31,
      replies: 19,
      isLiked: false,
      isSolved: false,
      tags: ['activism', 'community', 'climate-action']
    }
  ]);
  const [replyModal, setReplyModal] = useState<{ open: boolean; postId?: string }>({ open: false });
  const [replyText, setReplyText] = useState('');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'question', name: 'Questions' },
    { id: 'tips', name: 'Tips & Advice' },
    { id: 'project', name: 'Projects' },
    { id: 'discussion', name: 'Discussion' }
  ];

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleShare = async (id: string) => {
    const post = posts.find((currentPost) => currentPost.id === id);
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
      // Ignore share cancellation.
    }
  };

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal.postId || !replyText.trim()) return;

    setPosts((prev) =>
      prev.map((post) => (post.id === replyModal.postId ? { ...post, replies: post.replies + 1 } : post))
    );
    setReplyText('');
    setReplyModal({ open: false });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const loweredSearch = searchTerm.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(loweredSearch) ||
      post.content.toLowerCase().includes(loweredSearch) ||
      post.tags.some((tag) => tag.toLowerCase().includes(loweredSearch));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question':
        return 'border-blue-400/30 bg-blue-500/20 text-blue-400 dark:text-sky-300';
      case 'tips':
        return 'border-green-400/30 bg-green-500/20 text-green-400 dark:text-emerald-300';
      case 'project':
        return 'border-purple-400/30 bg-purple-500/20 text-purple-400 dark:text-violet-300';
      case 'discussion':
        return 'border-orange-400/30 bg-orange-500/20 text-orange-400 dark:text-orange-300';
      default:
        return 'border-gray-400/30 bg-gray-500/20 text-gray-400 dark:border-white/10 dark:text-slate-300';
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();

    setPosts((prev) => [
      {
        id,
        author: 'You',
        avatar: 'YU',
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
          .map((tag) => tag.trim())
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
      className={pageShell}
    >
      <div className="mb-8 text-center">
        <h1 className={`${pageTitle} mb-4`}>Eco Community</h1>
        <p className={pageSubtitle}>
          Connect with fellow environmental enthusiasts. Ask questions, share solutions, and collaborate on sustainable projects.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Members', value: '2.4K', color: 'text-green-400 dark:text-emerald-400' },
          { label: 'Posts Today', value: '47', color: 'text-blue-400 dark:text-sky-400' },
          { label: 'Solved Questions', value: '156', color: 'text-purple-400 dark:text-violet-400' },
          { label: 'Projects Shared', value: '89', color: 'text-orange-400 dark:text-orange-400' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            className={`${softCard} p-4 text-center`}
          >
            <div className={`mb-1 text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm font-medium text-sky-950/95 dark:text-slate-300">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search posts, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewPost(true)}
            className={primaryButton}
          >
            <Plus className="h-5 w-5" />
            New Post
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${chipBase} ${
                selectedCategory === category.id
                  ? 'border-blue-700 bg-blue-900 text-white dark:border-emerald-500 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500'
                  : 'border-slate-200/80 bg-white/88 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={`${glassCard} p-6`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-sm font-bold text-white dark:from-emerald-500 dark:to-teal-500">
                  {post.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sky-950 dark:text-white">{post.author}</h3>
                    {post.isSolved && (
                      <div className="flex items-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
                        <Award className="mr-1 h-3 w-3" />
                        Solved
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-sky-950/80 dark:text-slate-400">
                    <Clock className="mr-1 h-4 w-4" />
                    {post.timestamp}
                  </div>
                </div>
              </div>
              <div className={`rounded-full border px-3 py-1 text-sm font-bold ${getCategoryColor(post.category)}`}>
                {categories.find((category) => category.id === post.category)?.name}
              </div>
            </div>

            <h2 className="mb-3 text-xl font-bold text-sky-950 dark:text-white">{post.title}</h2>
            <p className="mb-4 leading-relaxed text-sky-950/85 dark:text-slate-300">{post.content}</p>

            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-sky-100/80 px-2 py-1 text-sm text-sky-950/95 dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-theme duration-300 ${
                    post.isLiked
                      ? 'bg-green-100 text-green-900 dark:text-emerald-300'
                      : 'border border-slate-200/80 bg-white/88 text-slate-800 hover:bg-white dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setReplyModal({ open: true, postId: post.id })}
                  className="flex items-center space-x-2 rounded-lg border border-slate-200/80 bg-white/88 px-3 py-2 text-sky-950 transition-theme duration-300 hover:bg-white dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{post.replies}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-2 rounded-lg border border-slate-200/80 bg-white/88 px-3 py-2 text-sky-950 transition-theme duration-300 hover:bg-white dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Share</span>
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReplyModal({ open: true, postId: post.id })}
                className={`${primaryButton} px-4 py-2`}
              >
                <Reply className="h-4 w-4" />
                Reply
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalBackdrop}
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className={`${modalPanel} max-w-2xl p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-sky-950 dark:text-white">Create New Post</h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="text-2xl text-slate-600 transition-colors hover:text-red-500 dark:text-slate-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-sky-950 dark:text-white">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className={inputClass}
                    placeholder="What's your question or topic?"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-sky-950 dark:text-white">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className={inputClass}
                  >
                    <option value="question">Question</option>
                    <option value="tips">Tips & Advice</option>
                    <option value="project">Project</option>
                    <option value="discussion">Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-sky-950 dark:text-white">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Share your thoughts, questions, or project details..."
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-sky-950 dark:text-white">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., recycling, solar-energy, composting"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" className={`flex-1 ${primaryButton}`}>
                    Post to Community
                  </button>
                  <button type="button" onClick={() => setShowNewPost(false)} className={secondaryButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {replyModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalBackdrop}
            onClick={() => setReplyModal({ open: false })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className={`${modalPanel} max-w-lg p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-sky-950 dark:text-white">Add a reply</h3>
                <button className="text-2xl text-slate-600 dark:text-slate-300" onClick={() => setReplyModal({ open: false })}>
                  ×
                </button>
              </div>
              <form onSubmit={submitReply} className="space-y-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className={`${inputClass} h-28 resize-none`}
                  placeholder="Write your reply..."
                  required
                />
                <div className="flex gap-3">
                  <button type="submit" className={`flex-1 ${primaryButton}`}>
                    Post Reply
                  </button>
                  <button type="button" onClick={() => setReplyModal({ open: false })} className={secondaryButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 rounded-2xl border border-green-300/30 bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 backdrop-blur-lg transition-theme duration-300 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/10"
      >
        <h2 className="mb-4 text-2xl font-bold text-sky-950 dark:text-white">Community Guidelines</h2>
        <div className="grid gap-4 text-sky-950/85 dark:text-slate-300 md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-bold text-green-900 dark:text-white">Be Respectful</h3>
            <p className="text-sm">Treat all community members with kindness and respect.</p>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-green-900 dark:text-white">Share Knowledge</h3>
            <p className="text-sm">Help others by sharing your environmental expertise and experiences.</p>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-green-900 dark:text-white">Stay On Topic</h3>
            <p className="text-sm">Keep discussions focused on environmental and sustainability topics.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Community;
