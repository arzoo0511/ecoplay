import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  Share2,
  ThumbsUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import {
  dbFunctions,
  CommunityPost,
  CommunityReply,
} from '../lib/supabase';
import {
  glassCard,
  inputClass,
  pageShell,
  primaryButton,
  secondaryButton,
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
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispatch } = useGame();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [nestedReplyText, setNestedReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!postId) return;

    const loadPostAndReplies = async () => {
      setLoading(true);
      setError(null);
      try {
        const postData = await dbFunctions.getCommunityPost(postId);
        if (!postData) {
          setError('Post not found.');
          setLoading(false);
          return;
        }
        setPost(postData);

        // Fetch replies
        setRepliesLoading(true);
        const repliesData = await dbFunctions.getCommunityPostReplies(postId);
        setReplies(repliesData);
        setRepliesLoading(false);

        // Fetch user liked status
        if (user) {
          const likedPosts = await dbFunctions.getUserLikedPosts(user.id);
          setIsLiked(likedPosts.includes(postId));
        }
      } catch (err: any) {
        console.error('Error loading post details:', err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    loadPostAndReplies();
  }, [postId, user]);

  const handleLike = async () => {
    if (!post || !user) return;

    const nextLikedState = !isLiked;
    setIsLiked(nextLikedState);
    setPost((prev) =>
      prev ? { ...prev, likes: nextLikedState ? prev.likes + 1 : Math.max(0, prev.likes - 1) } : null
    );

    const success = await dbFunctions.updateCommunityPostLikes(post.id, nextLikedState);
    if (!success) {
      // Revert if database updates fail
      setIsLiked(isLiked);
      setPost((prev) =>
        prev ? { ...prev, likes: isLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1) } : null
      );
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const url = `${window.location.origin}/community/post/${post.id}`;
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

  const handleToggleSolved = async () => {
    if (!post || !user) return;
    const nextSolved = !post.is_solved;
    setPost((prev) => (prev ? { ...prev, is_solved: nextSolved } : null));

    const success = await dbFunctions.togglePostSolvedStatus(post.id, nextSolved);
    if (success) {
      if (nextSolved) {
        dispatch({ type: 'ADD_POINTS', payload: 25, activityType: 'community_solution' });
      }
    } else {
      // Revert
      setPost((prev) => (prev ? { ...prev, is_solved: !nextSolved } : null));
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user || !replyText.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const { data: addedReply, error: replyErr } = await dbFunctions.addCommunityPostReply(
        post.id,
        user.id,
        replyText.trim(),
        null
      );

      if (replyErr) {
        alert(`Failed to post reply: ${replyErr.message}`);
        return;
      }

      if (addedReply) {
        setReplies((prev) => [...prev, addedReply]);
        setPost((prev) => (prev ? { ...prev, replies: prev.replies + 1 } : null));
        setReplyText('');
      }
    } catch (err: any) {
      console.error('Error adding reply:', err);
      alert(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleNestedReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!post || !user || !nestedReplyText.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const { data: addedReply, error: replyErr } = await dbFunctions.addCommunityPostReply(
        post.id,
        user.id,
        nestedReplyText.trim(),
        parentId
      );

      if (replyErr) {
        alert(`Failed to post nested reply: ${replyErr.message}`);
        return;
      }

      if (addedReply) {
        setReplies((prev) => [...prev, addedReply]);
        setPost((prev) => (prev ? { ...prev, replies: prev.replies + 1 } : null));
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

  const renderCommentNode = (node: CommentTreeNode, depth: number = 0) => {
    const replyAuthorName = node.users?.name || node.author_name || 'Anonymous';
    const isReplying = replyingToId === node.id;
    
    return (
      <div key={node.id} className="group/comment space-y-2">
        {/* Comment Card */}
        <div className="flex items-start space-x-3 rounded-2xl bg-slate-50/50 p-4 dark:bg-slate-900/40">
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
              <span className="text-[10px] text-slate-500 dark:text-slate-550">
                {formatRelativeTime(node.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-sky-950/90 dark:text-slate-300">
              {node.content}
            </p>
            
            {/* Reply trigger under comment */}
            {user && (
              <div className="mt-2 flex items-center space-x-3">
                <button
                  onClick={() => {
                    setReplyingToId(isReplying ? null : node.id);
                    setNestedReplyText('');
                  }}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reply form under the comment */}
        {isReplying && (
          <form
            onSubmit={(e) => handleNestedReplySubmit(e, node.id)}
            className="pl-6 sm:pl-8 flex items-end space-x-2 mt-2"
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
                  handleNestedReplySubmit(e, node.id);
                }
              }}
            />
            <button
              type="button"
              onClick={() => setReplyingToId(null)}
              className="px-3 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!nestedReplyText.trim() || submittingReply}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 ${primaryButton}`}
            >
              {submittingReply ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </form>
        )}

        {/* Indented child replies */}
        {node.children && node.children.length > 0 && (
          <div className="pl-4 sm:pl-6 border-l-2 border-slate-200/50 dark:border-white/10 ml-4 space-y-3 mt-2">
            {node.children.map(child => renderCommentNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={pageShell}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={pageShell}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full bg-red-500/10 p-3 text-red-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Error</h2>
          <p className="mt-2 text-slate-300">{error || 'Post not found.'}</p>
          <button
            onClick={() => navigate('/community')}
            className={`mt-6 ${secondaryButton} px-6 py-2.5`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const authorName = post.users?.name || post.author_name || 'Anonymous';
  const categoryColors: Record<string, string> = {
    question: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    tip: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    project: 'bg-sky-500/10 text-sky-400 border border-sky-500/25',
    discussion: 'bg-purple-500/10 text-purple-400 border border-purple-500/25',
  };

  return (
    <div className={pageShell}>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community')}
          className="group flex items-center space-x-2 text-sm font-bold text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Community</span>
        </button>

        {/* Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={glassCard}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {post.users?.avatar_url ? (
                <img
                  src={post.users.avatar_url}
                  alt={authorName}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 font-bold text-white dark:from-emerald-500 dark:to-teal-500">
                  {getInitials(authorName)}
                </div>
              )}
              <div>
                <h3 className="text-sm font-black text-sky-950 dark:text-slate-100">{authorName}</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Category tag */}
            <span className={`rounded-xl px-2.5 py-1 text-xs font-bold capitalize ${categoryColors[post.category] || categoryColors.discussion}`}>
              {post.category}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-black text-sky-950 dark:text-white">{post.title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-sky-950/80 dark:text-slate-200">{post.content}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-200/50 pt-4 dark:border-white/10">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 transition-all duration-300 ${
                  isLiked
                    ? 'bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'border border-slate-200/80 bg-white/50 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-semibold">{post.likes}</span>
              </motion.button>

              <button
                onClick={() => replyInputRef.current?.focus()}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 bg-white/50 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">{post.replies}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 bg-white/50 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Share</span>
              </button>
            </div>

            {user && post.user_id === user.id && post.category === 'question' && (
              <button
                onClick={handleToggleSolved}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all duration-300 ${
                  post.is_solved
                    ? 'border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-slate-200/80 bg-white/50 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {post.is_solved ? 'Unmark Solved' : 'Mark as Solved'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Comments Section */}
        <div className={glassCard}>
          <h4 className="mb-4 text-md font-black text-sky-950 dark:text-slate-200">
            Comments ({replies.length})
          </h4>

          {repliesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : replies.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No comments yet. Be the first to reply!
            </p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
              {buildCommentTree(replies).map((rootNode) => renderCommentNode(rootNode))}
            </div>
          )}

          {/* Add comment Form */}
          {user && (
            <form onSubmit={handleSubmitReply} className="mt-6 flex items-end space-x-2">
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
                    handleSubmitReply(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!replyText.trim() || submittingReply}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 ${primaryButton}`}
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
      </div>
    </div>
  );
}
