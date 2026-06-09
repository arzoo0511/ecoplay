import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Award,
  Clock,
  MessageCircle,
  Plus,
  Reply,
  Search,
  Share2,
  ThumbsUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

import {
  dbFunctions,
  supabase,
  CommunityPost,
  CommunityReply,
} from '../lib/supabase';

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

// Utility for relative time strings
const formatRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Some time ago';
  }
};

// Utility to extract name initials
const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const PostSkeleton = () => (
  <div className="animate-pulse space-y-4 rounded-2xl border border-white/20 bg-white/20 p-6 dark:border-white/5 dark:bg-white/5">
    <div className="flex items-center space-x-3">
      <div className="h-12 w-12 rounded-full bg-slate-300 dark:bg-slate-700"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/4 rounded bg-slate-300 dark:bg-slate-700"></div>
        <div className="h-3 w-1/6 rounded bg-slate-300 dark:bg-slate-700"></div>
      </div>
    </div>
    <div className="h-6 w-3/4 rounded bg-slate-300 dark:bg-slate-700"></div>
    <div className="space-y-2">
      <div className="h-4 w-full rounded bg-slate-300 dark:bg-slate-700"></div>
      <div className="h-4 w-5/6 rounded bg-slate-300 dark:bg-slate-700"></div>
    </div>
    <div className="flex space-x-2 pt-2">
      <div className="h-8 w-16 rounded-lg bg-slate-300 dark:bg-slate-700"></div>
      <div className="h-8 w-16 rounded-lg bg-slate-300 dark:bg-slate-700"></div>
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse rounded-xl border border-white/20 bg-white/20 p-4 text-center dark:border-white/10 dark:bg-slate-900/40">
        <div className="mx-auto mb-2 h-6 w-1/2 rounded bg-slate-300 dark:bg-slate-700"></div>
        <div className="mx-auto h-4 w-3/4 rounded bg-slate-300 dark:bg-slate-700"></div>
      </div>
    ))}
  </div>
);

const Community = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { dispatch } = useGame();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Platform statistics
  const [stats, setStats] = useState({
    members_count: 0,
    posts_count: 0,
    solved_count: 0,
    projects_count: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Search & Category Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New Post Form
  const [showNewPost, setShowNewPost] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'question',
    tags: '',
  });

  // Comments / Replies State
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, CommunityReply[]>>({});
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState('');
  const [nestedReplyText, setNestedReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Tracking post liked status for current user
  const [userLikedPostIds, setUserLikedPostIds] = useState<Set<string>>(new Set());

  // Track which posts the user has liked in this session
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'question', name: 'Questions' },
    { id: 'tips', name: 'Tips & Advice' },
    { id: 'project', name: 'Projects' },
    { id: 'discussion', name: 'Discussion' },
  ];

  // Fetch Community Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    const statsData = await dbFunctions.getCommunityStats();
    if (statsData) {
      setStats(statsData);
    }
    setStatsLoading(false);
  };

  // Load initial posts and user likes
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const postsData = await dbFunctions.getCommunityPosts(100);
      setPosts(postsData);

      if (user) {
        const likedPosts = await dbFunctions.getUserLikedPosts(user.id);
        setUserLikedPostIds(new Set(likedPosts));
      }

      await fetchStats();
    } catch (err: any) {
      console.error('Error loading community data:', err);
      setError('Failed to load community content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Real-time synchronization
  useEffect(() => {
    // Listen to changes in community_posts
    const postChannel = supabase
      .channel('community_posts_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newPost, error } = await supabase
              .from('community_posts')
              .select(`
                *,
                users (
                  name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();
            if (!error && newPost) {
              setPosts((prev) => {
                if (prev.some((p) => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
              });
              // Refresh counts
              fetchStats();
            }
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === payload.new.id
                  ? {
                      ...post,
                      title: payload.new.title,
                      content: payload.new.content,
                      category: payload.new.category,
                      tags: payload.new.tags,
                      likes: payload.new.likes,
                      replies: payload.new.replies,
                      is_solved: payload.new.is_solved,
                      updated_at: payload.new.updated_at,
                    }
                  : post
              )
            );
            fetchStats();
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((post) => post.id !== payload.old.id));
            fetchStats();
          }
        }
      )
      .subscribe();

    // Listen to community_replies to update live comments list
    const repliesChannel = supabase
      .channel('community_replies_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_replies' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newReply, error } = await supabase
              .from('community_replies')
              .select(`
                *,
                users (
                  name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && newReply) {
              setReplies((prev) => {
                const postReplies = prev[newReply.post_id] || [];
                if (postReplies.some((r) => r.id === newReply.id)) return prev;
                return {
                  ...prev,
                  [newReply.post_id]: [...postReplies, newReply],
                };
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setReplies((prev) => {
              const postReplies = prev[payload.old.post_id] || [];
              return {
                ...prev,
                [payload.old.post_id]: postReplies.filter((r) => r.id !== payload.old.id),
              };
            });
          }
        }
      )
      .subscribe();

    // Listen to community_post_likes to update current user's liked list if modified elsewhere
    const likesChannel = supabase
      .channel('community_post_likes_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_post_likes' },
        (payload) => {
          if (user && payload.eventType === 'INSERT' && payload.new.user_id === user.id) {
            setUserLikedPostIds((prev) => {
              const next = new Set(prev);
              next.add(payload.new.post_id);
              return next;
            });
          } else if (user && payload.eventType === 'DELETE' && payload.old.user_id === user.id) {
            setUserLikedPostIds((prev) => {
              const next = new Set(prev);
              next.delete(payload.old.post_id);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user]);

  // Handle post submit
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submittingPost) return;

    setSubmittingPost(true);
    const tagsArray = newPost.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const postPayload = {
      user_id: user.id,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: tagsArray,
      likes: 0,
      replies: 0,
      is_solved: false,
    };

    try {
      const { data: createdPost, error } = await dbFunctions.createCommunityPost(postPayload);
      if (error) {
        alert(`Failed to submit post: ${error.message}`);
        console.error('Error submitting post:', error);
        return;
      }
      if (createdPost) {
        setPosts((prev) => [createdPost, ...prev]);
        setShowNewPost(false);
        setNewPost({ title: '', content: '', category: 'question', tags: '' });
        
        // Award XP for creating post (+15 points)
        dispatch({ type: 'ADD_POINTS', payload: 15, activityType: 'community_post' });
        
        await fetchStats();
      }
    } catch (err: any) {
      console.error('Error submitting post:', err);
      alert(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Optimistic post liking
  const handleLike = async (postId: string) => {
    if (!user) return;

    const isCurrentlyLiked = userLikedPostIds.has(postId);

    // Optimistically update state
    setUserLikedPostIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: isCurrentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1 }
          : post
      )
    );

    const success = await dbFunctions.updateCommunityPostLikes(postId, !isCurrentlyLiked);
    if (!success) {
      // Revert if database updates fail
      setUserLikedPostIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: isCurrentlyLiked ? post.likes + 1 : Math.max(0, post.likes - 1) }
            : post
        )
      );
    }
  };

  // Toggle replies display and fetch comments lazily
  const handleToggleReplies = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      setReplyText('');
      
      // Lazily fetch replies if not loaded
      if (!replies[postId]) {
        setRepliesLoading((prev) => ({ ...prev, [postId]: true }));
        try {
          const postReplies = await dbFunctions.getCommunityPostReplies(postId);
          setReplies((prev) => ({ ...prev, [postId]: postReplies }));
        } catch (err) {
          console.error('Error fetching replies:', err);
        } finally {
          setRepliesLoading((prev) => ({ ...prev, [postId]: false }));
        }
      }

      // Small delay to let container expand, then focus text area
      setTimeout(() => {
        replyInputRef.current?.focus();
      }, 100);
    }
  };

  // Submit comment/reply
  const handleSubmitReply = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user || !replyText.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const { data: addedReply, error } = await dbFunctions.addCommunityPostReply(
        postId,
        user.id,
        replyText.trim()
      );

      if (error) {
        alert(`Failed to post reply: ${error.message}`);
        console.error('Error adding reply:', error);
        return;
      }

      if (addedReply) {
        setReplies((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), addedReply],
        }));

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, replies: post.replies + 1 } : post
          )
        );

        setReplyText('');
      }
    } catch (err: any) {
      console.error('Error adding reply:', err);
      alert(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleNestedReplySubmit = async (e: React.FormEvent, postId: string, parentId: string) => {
    e.preventDefault();
    if (!user || !nestedReplyText.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const { data: addedReply, error } = await dbFunctions.addCommunityPostReply(
        postId,
        user.id,
        nestedReplyText.trim(),
        parentId
      );

      if (error) {
        alert(`Failed to post nested reply: ${error.message}`);
        console.error('Error adding reply:', error);
        return;
      }

      if (addedReply) {
        setReplies((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), addedReply],
        }));

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, replies: post.replies + 1 } : post
          )
        );

        setNestedReplyText('');
        setReplyingToId(null);
      }
    } catch (err: any) {
      console.error('Error adding nested reply:', err);
      alert(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setSubmittingReply(false);
    }
  };

  interface CommentTreeNode extends CommunityReply {
    children: CommentTreeNode[];
  }

  const buildCommentTree = (flatReplies: CommunityReply[]): CommentTreeNode[] => {
    const replyMap: Record<string, CommentTreeNode> = {};
    
    flatReplies.forEach(reply => {
      replyMap[reply.id] = { ...reply, children: [] };
    });
    
    const roots: CommentTreeNode[] = [];
    
    flatReplies.forEach(reply => {
      const mapped = replyMap[reply.id];
      if (reply.parent_id && replyMap[reply.parent_id]) {
        replyMap[reply.parent_id].children.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    const sortByDate = (a: CommentTreeNode, b: CommentTreeNode) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

    roots.sort(sortByDate);
    roots.forEach(root => root.children.sort(sortByDate));
    
    return roots;
  };

  const renderCommentNode = (node: CommentTreeNode, postId: string, depth: number = 0) => {
    const replyAuthorName = node.users?.name || node.author_name || 'Anonymous';
    const isReplying = replyingToId === node.id;
    
    return (
      <div key={node.id} className="group/comment space-y-1.5 mt-2">
        <div className="flex items-start space-x-2.5 rounded-xl bg-slate-50/70 p-3 dark:bg-slate-900/40">
          {node.users?.avatar_url ? (
            <img
              src={node.users.avatar_url}
              alt={replyAuthorName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-xs font-bold text-white dark:from-emerald-500 dark:to-teal-500">
              {getInitials(replyAuthorName)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-950 dark:text-slate-200">
                {replyAuthorName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-500">
                {formatRelativeTime(node.created_at)}
              </span>
            </div>
            
            <p className="mt-0.5 text-sm leading-relaxed text-sky-950/90 dark:text-slate-300">
              {node.content}
            </p>
            
            {user && (
              <div className="mt-1 flex items-center space-x-3">
                <button
                  onClick={() => {
                    setReplyingToId(isReplying ? null : node.id);
                    setNestedReplyText('');
                  }}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>

        {isReplying && (
          <form
            onSubmit={(e) => handleNestedReplySubmit(e, postId, node.id)}
            className="pl-6 sm:pl-8 flex items-end space-x-2 mt-1.5"
          >
            <textarea
              value={nestedReplyText}
              onChange={(e) => setNestedReplyText(e.target.value)}
              placeholder={`Reply to ${replyAuthorName}...`}
              rows={1}
              required
              className={`${inputClass} h-9 min-h-[36px] flex-1 resize-none py-1.5 text-sm scrollbar-none`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleNestedReplySubmit(e, postId, node.id);
                }
              }}
            />
            <button
              type="button"
              onClick={() => setReplyingToId(null)}
              className="px-2.5 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!nestedReplyText.trim() || submittingReply}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white transition-all hover:opacity-90 disabled:opacity-50 dark:from-emerald-500 dark:to-teal-500"
            >
              {submittingReply ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </form>
        )}

        {node.children && node.children.length > 0 && (
          <div className="pl-3 sm:pl-4 border-l border-slate-200/50 dark:border-white/5 ml-4 space-y-2 mt-1.5">
            {node.children.map(child => renderCommentNode(child, postId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Toggle is_solved status for questions
  const handleToggleSolved = async (postId: string, currentSolved: boolean) => {
    if (!user) return;
    
    // Optimistic status update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, is_solved: !currentSolved } : post
      )
    );

    const success = await dbFunctions.togglePostSolvedStatus(postId, !currentSolved);
    if (success) {
      // Award XP on successful solving (+25 points)
      if (!currentSolved) {
        dispatch({ type: 'ADD_POINTS', payload: 25, activityType: 'community_solution' });
      }
      await fetchStats();
    } else {
      // Revert if database query failed
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, is_solved: currentSolved } : post
        )
      );
    }
  };

  // Share link trigger
  const handleShare = async (id: string) => {
    const post = posts.find((currentPost) => currentPost.id === id);
    if (!post) return;

    const url = `${window.location.origin}/community/post/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: 'Check out this post on EcoPlay Community!', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Post link copied to clipboard!');
      }
    } catch {
      // Ignore cancel
    }
  };

  // Filter and search logic
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const loweredSearch = searchTerm.toLowerCase();
    const authorName = post.users?.name || post.author_name || 'Anonymous';
    const matchesSearch =
      post.title.toLowerCase().includes(loweredSearch) ||
      post.content.toLowerCase().includes(loweredSearch) ||
      post.tags.some((tag) => tag.toLowerCase().includes(loweredSearch)) ||
      authorName.toLowerCase().includes(loweredSearch);
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question':
        return 'border-blue-400/30 bg-blue-500/20 text-blue-600 dark:text-sky-300';
      case 'tips':
        return 'border-green-400/30 bg-green-500/20 text-green-600 dark:text-emerald-300';
      case 'project':
        return 'border-purple-400/30 bg-purple-500/20 text-purple-600 dark:text-violet-300';
      case 'discussion':
        return 'border-orange-400/30 bg-orange-500/20 text-orange-600 dark:text-orange-300';
      default:
        return 'border-gray-400/30 bg-gray-500/20 text-gray-500 dark:border-white/10 dark:text-slate-300';
    }
  };


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

      {/* Statistics Section */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { label: 'Active Members', value: (stats?.members_count ?? 0).toLocaleString(), color: 'text-green-500 dark:text-emerald-400' },
            { label: 'Total Posts', value: (stats?.posts_count ?? 0).toLocaleString(), color: 'text-blue-500 dark:text-sky-400' },
            { label: 'Solved Questions', value: (stats?.solved_count ?? 0).toLocaleString(), color: 'text-purple-500 dark:text-violet-400' },
            { label: 'Projects Shared', value: (stats?.projects_count ?? 0).toLocaleString(), color: 'text-orange-500 dark:text-orange-400' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03 }}
              className={`${softCard} p-4 text-center`}
            >
              <div className={`mb-1 text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm font-semibold text-sky-950/95 dark:text-slate-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts, tags, authors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
                  : 'border-slate-200/80 bg-white/80 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-600 dark:text-red-400">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={loadInitialData}
            className="mt-2 text-sm font-bold underline hover:text-red-500"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Main Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          [1, 2, 3].map((n) => <PostSkeleton key={n} />)
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-xl font-bold text-sky-950 dark:text-white">No discussions found</h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {searchTerm || selectedCategory !== 'all'
                ? "We couldn't find any posts matching your filters. Try adjusting your search query."
                : 'Be the first one to start a conversation in our community!'}
            </p>
            <button
              onClick={() => setShowNewPost(true)}
              className={primaryButton}
            >
              Start a Conversation
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${glassCard} overflow-hidden p-6 transition-all duration-300`}
            >
              {(() => {
                const postAuthorName = post.users?.name || post.author_name || 'Anonymous';
                return (
                  <>
                    {/* Post Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {post.users?.avatar_url ? (
                          <img
                            src={post.users.avatar_url}
                            alt={postAuthorName}
                            className="h-12 w-12 rounded-full border border-emerald-500/20 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-sm font-bold text-white dark:from-emerald-500 dark:to-teal-500">
                            {getInitials(postAuthorName)}
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-sky-950 dark:text-white">{postAuthorName}</h3>
                            {post.is_solved && (
                              <span className="flex items-center rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                <Award className="mr-0.5 h-3 w-3" />
                                Solved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-sky-950/70 dark:text-slate-400">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            {formatRelativeTime(post.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCategoryColor(post.category)}`}>
                        {categories.find((c) => c.id === post.category)?.name}
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Post Title & Content */}
              <h2
                onClick={() => navigate(`/community/post/${post.id}`)}
                className="mb-2 text-xl font-bold text-sky-950 dark:text-white cursor-pointer hover:text-emerald-500 transition-colors"
              >
                {post.title}
              </h2>
              <p
                onClick={() => navigate(`/community/post/${post.id}`)}
                className="mb-4 whitespace-pre-wrap leading-relaxed text-sky-950/85 dark:text-slate-300 cursor-pointer hover:text-sky-900 dark:hover:text-white transition-colors"
              >
                {post.content}
              </p>

              {/* Post Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-sky-100/70 px-2.5 py-1 text-xs font-medium text-sky-950/90 dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Action Buttons */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-200/50 pt-4 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 transition-all duration-300 ${
                      userLikedPostIds.has(post.id)
                        ? 'bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'border border-slate-200/80 bg-white/50 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleReplies(post.id)}
                    className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 bg-white/50 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{post.replies}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 bg-white/50 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden text-sm font-semibold sm:inline">Share</span>
                  </motion.button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Mark as Solved action - only visible to post owner if it's a question */}
                  {user && post.user_id === user.id && post.category === 'question' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleToggleSolved(post.id, post.is_solved)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all duration-300 ${
                        post.is_solved
                          ? 'border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'border-slate-200/80 bg-white/50 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {post.is_solved ? 'Unmark Solved' : 'Mark as Solved'}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleToggleReplies(post.id)}
                    className={`${primaryButton} px-4 py-2 text-sm`}
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </motion.button>
                </div>
              </div>

              {/* Inline Comments/Replies Section */}
              <AnimatePresence>
                {expandedPostId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 border-t border-slate-200/40 pt-4 dark:border-white/5">
                      <h4 className="mb-3 text-sm font-bold text-sky-950/80 dark:text-slate-400">
                        Comments ({replies[post.id]?.length || 0})
                      </h4>

                      {/* Comments Feed */}
                      <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {repliesLoading[post.id] ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                          </div>
                        ) : !replies[post.id] || replies[post.id].length === 0 ? (
                          <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                            No comments yet. Be the first to reply!
                          </p>
                        ) : (
                          <div className="space-y-2 pr-1">
                            {buildCommentTree(replies[post.id]).map((rootNode) => 
                              renderCommentNode(rootNode, post.id)
                            )}
                          </div>
                        )}
                      </div>

                      {/* Add Comment Input Form */}
                      {user && (
                        <form
                          onSubmit={(e) => handleSubmitReply(e, post.id)}
                          className="mt-4 flex items-end space-x-2"
                        >
                          <textarea
                            ref={replyInputRef}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write an insightful reply..."
                            rows={1}
                            required
                            className={`${inputClass} h-11 min-h-[44px] flex-1 resize-none py-2.5 scrollbar-none`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitReply(e, post.id);
                              }
                            }}
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim() || submittingReply}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white transition-all hover:opacity-90 disabled:opacity-50 dark:from-emerald-500 dark:to-teal-500"
                          >
                            {submittingReply ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Create New Post Modal */}
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
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className={`${modalPanel} max-w-2xl p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-sky-950 dark:text-white font-display">Create New Post</h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="text-3xl text-slate-400 transition-colors hover:text-red-500 dark:text-slate-300"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-sky-950 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className={inputClass}
                    placeholder="Enter a descriptive title for your post..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-sky-950 dark:text-slate-300">Category</label>
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="question">Question</option>
                      <option value="tips">Tips & Advice</option>
                      <option value="project">Project</option>
                      <option value="discussion">Discussion</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-sky-950 dark:text-slate-300">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. recycling, composting, solar"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-sky-950 dark:text-slate-300">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className={`${inputClass} h-36 resize-none`}
                    placeholder="Provide detailed information, questions, or updates regarding your environment efforts..."
                    required
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewPost(false)}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className={`${primaryButton} sm:px-6`}
                  >
                    {submittingPost ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post to Community'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guidelines Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-2xl border border-green-300/30 bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 backdrop-blur-lg dark:border-emerald-500/20 dark:from-emerald-500/5 dark:to-teal-500/5"
      >
        <h2 className="mb-4 text-2xl font-bold text-sky-950 dark:text-white">Community Guidelines</h2>
        <div className="grid gap-6 text-sky-950/85 dark:text-slate-300 md:grid-cols-3">
          <div>
            <h3 className="mb-1.5 font-bold text-green-950 dark:text-white">Be Respectful</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Treat all community members with kindness, empathy, and respect. Constructive advice is always welcome!
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-bold text-green-950 dark:text-white">Share Knowledge</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Help others by sharing your environmental expertise, garden designs, green technology insights, or tips.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-bold text-green-950 dark:text-white">Stay On Topic</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ensure all posts relate directly to environment sustainability, ecology, climate changes, and eco preservation.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Community;
