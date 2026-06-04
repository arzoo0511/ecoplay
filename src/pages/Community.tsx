import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, MessageCircle, Plus, Reply, Search, Share2, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
import { dbFunctions, CommunityPost } from '../lib/supabase';

const Community = () => {
 feature/mobile-responsiveness-dashboard

  
 

React.useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1500);

  return () => clearTimeout(timer);
}, []);


  const { isGuest } = useAuth();

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
  const { isGuest ,  user } = useAuth();

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'question',
    tags: ''
  });
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [replyModal, setReplyModal] = useState<{ open: boolean; postId?: string }>({ open: false });
  const [replyText, setReplyText] = useState('');

  // Track which posts the user has liked in this session
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'question', name: 'Questions' },
    { id: 'tips', name: 'Tips & Advice' },
    { id: 'project', name: 'Projects' },
    { id: 'discussion', name: 'Discussion' }
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await dbFunctions.getCommunityPosts(50);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id: string) => {
    const isLiked = likedPosts.has(id);
    const increment = !isLiked;

    // Optimistic UI
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, likes: post.likes + (increment ? 1 : -1) }
          : post
      )
    );

    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (increment) next.add(id);
      else next.delete(id);
      return next;
    });

    const success = await dbFunctions.updateCommunityPostLikes(id, increment);
    if (!success) {
      // Revert optimistic UI
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, likes: post.likes - (increment ? 1 : -1) }
            : post
        )
      );
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (increment) next.delete(id);
        else next.add(id);
        return next;
      });
      console.error('Failed to update like status');
    }
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

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal.postId || !replyText.trim()) return;

    const postId = replyModal.postId;

    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, replies: post.replies + 1 } : post))
    );
    setReplyText('');
    setReplyModal({ open: false });

    const success = await dbFunctions.addCommunityPostReply(postId);
    if (!success) {
      // Revert optimistic UI
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, replies: post.replies - 1 } : post))
      );
      console.error('Failed to submit reply');
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to post");
      return;
    }

    const tagsArray = newPost.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const postToCreate = {
      user_id: user.id,
      author_name: user.name || 'EcoWarrior',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: tagsArray,
      likes: 0,
      replies: 0,
      is_solved: false
    };

    setShowNewPost(false);
    setNewPost({ title: '', content: '', category: 'question', tags: '' });

    // Optimistically show loading, but re-fetch everything
    setLoading(true);
    const success = await dbFunctions.createCommunityPost(postToCreate);
    if (success) {
      await fetchPosts();
    } else {
      alert("Failed to create post");
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const loweredSearch = searchTerm.toLowerCase();

    // Ensure safety in case arrays or strings are null from DB
    const safeTitle = post.title || '';
    const safeContent = post.content || '';
    const safeTags = post.tags || [];

    const matchesSearch =
      safeTitle.toLowerCase().includes(loweredSearch) ||
      safeContent.toLowerCase().includes(loweredSearch) ||
      safeTags.some((tag) => tag.toLowerCase().includes(loweredSearch));

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">

        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="h-10 w-64 bg-white/10 rounded-full mx-auto"></div>
          <div className="h-4 w-96 bg-white/10 rounded-full mx-auto"></div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="h-14 flex-1 rounded-2xl bg-white/10"></div>
          <div className="h-14 w-40 rounded-2xl bg-white/10"></div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-10 w-28 rounded-full bg-white/10"
            />
          ))}
        </div>

        {/* Posts Skeleton */}
        {[1, 2, 3].map((post) => (
          <div
            key={post}
            className="relative overflow-hidden bg-white/[0.06] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10"></div>

                <div className="flex-1">
                  <div className="h-4 w-32 rounded-full bg-white/10 mb-2"></div>
                  <div className="h-3 w-24 rounded-full bg-white/5"></div>
                </div>
              </div>

              <div className="h-6 w-3/4 rounded-full bg-white/10"></div>

              <div className="space-y-2">
                <div className="h-3 rounded-full bg-white/10"></div>
                <div className="h-3 rounded-full bg-white/10 w-5/6"></div>
                <div className="h-3 rounded-full bg-white/10 w-4/6"></div>
              </div>

              <div className="flex gap-2">
                <div className="h-8 w-20 rounded-full bg-white/10"></div>
                <div className="h-8 w-20 rounded-full bg-white/10"></div>
                <div className="h-8 w-20 rounded-full bg-white/10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className={`${pageShell} min-h-screen flex items-center justify-center`}>
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/90 p-8 text-center shadow-2xl dark:bg-white/5">
          <h1 className="text-3xl font-bold text-sky-950 dark:text-white">
            Community features are available to registered users.
          </h1>
          <button
            onClick={() => navigate('/login')}
            className={`${primaryButton} mt-6 justify-center`}
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

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
          { label: 'Posts Today', value: posts.length, color: 'text-blue-400 dark:text-sky-400' },
          { label: 'Solved Questions', value: posts.filter(p => p.is_solved).length, color: 'text-purple-400 dark:text-violet-400' },
          { label: 'Projects Shared', value: posts.filter(p => p.category === 'project').length, color: 'text-orange-400 dark:text-orange-400' }
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
              className={`${chipBase} ${selectedCategory === category.id
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
        {loading ? (
          <div className="text-center p-10">
            <p className="text-slate-500 dark:text-slate-400">Loading posts from Supabase...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center p-10">
            <p className="text-slate-500 dark:text-slate-400">No posts found. Be the first to start a discussion!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
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
                    {post.author_name ? post.author_name.substring(0, 2).toUpperCase() : 'EC'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sky-950 dark:text-white">{post.author_name || 'Anonymous'}</h3>
                      {post.is_solved && (
                        <div className="flex items-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
                          <Award className="mr-1 h-3 w-3" />
                          Solved
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-sky-950/80 dark:text-slate-400">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDate(post.created_at)}
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
                {(post.tags || []).map((tag) => (
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
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-theme duration-300 ${likedPosts.has(post.id)
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
          ))
        )}
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
        <div className="grid grid-cols-1 gap-4 text-sky-950/85 dark:text-slate-300 sm:grid-cols-2 md:grid-cols-3">
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
