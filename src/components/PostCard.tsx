import React, { useState } from 'react';
import { Heart, MessageCircle, Send, ShieldAlert, Award } from 'lucide-react';
import { Post, Comment } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface PostCardProps {
  post: Post;
  currentUsername: string;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, text: string) => Promise<Comment>;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUsername, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const isLikedByMe = post.likes.includes(currentUsername);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
    } catch (e) {
      console.error("Comment submit error", e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const postDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Helper to draw random gold avatar gradients if DiceBear is slow
  const getGradientAvatar = (seed: string) => {
    const colors = [
      'from-brand-gold to-brand-gold-dark',
      'from-brand-gold to-yellow-600',
      'from-brand-sand to-brand-gold',
      'from-brand-slate to-brand-charcoal',
      'from-yellow-500 to-amber-700'
    ];
    // Hash seed to choose a gradient
    const charSum = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const chosenColor = colors[charSum % colors.length];
    return `bg-gradient-to-tr ${chosenColor}`;
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-3xl overflow-hidden shadow-2xl hover:border-[#333] transition-all">
      {/* Post Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Story-ring indicator for close friends */}
            <div className="absolute inset-[-3px] bg-gradient-to-tr from-brand-gold via-yellow-500 to-amber-700 rounded-full animate-pulse-ring" />
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-brand-charcoal font-bold text-sm relative z-10 border-2 border-brand-charcoal ${getGradientAvatar(post.username)}`}>
              {post.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white tracking-wide">@{post.username}</span>
              <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5" /> Close Friend
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{formatRelativeTime(post.timestamp)}</span>
          </div>
        </div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]/60 font-mono flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full border border-[#222]">
          🔒 Private Feed
        </div>
      </div>

      {/* Post Content & Media */}
      <div className="relative bg-[#050505]">
        {/* Render Photo */}
        {post.type === 'photo' && post.mediaUrl && (
          <div className="w-full flex items-center justify-center overflow-hidden bg-black max-h-[450px]">
            <img
              src={post.mediaUrl}
              alt="Shared content"
              className={`w-full h-full object-contain ${post.filter}`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Render Video */}
        {post.type === 'video' && post.mediaUrl && (
          <div className="w-full flex items-center justify-center overflow-hidden bg-black max-h-[450px]">
            <video
              src={post.mediaUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Render Voice note card */}
        {post.type === 'voice' && post.voiceUrl && (
          <div className="p-6 bg-gradient-to-br from-[#111] to-[#0A0A0A] border-b border-black/30 flex justify-center items-center">
            <AudioPlayer src={post.voiceUrl} />
          </div>
        )}

        {/* Render plain text post background */}
        {post.type === 'text' && (
          <div className="p-8 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] text-center flex flex-col justify-center items-center min-h-[160px] border-b border-black/30 relative">
            <p className="text-xl font-serif italic text-white max-w-md leading-relaxed">
              "{post.content}"
            </p>
          </div>
        )}

        {/* Floating Sticker Attachment (superimposed, just like Insta!) */}
        {post.sticker && (
          <div className={`absolute select-none pointer-events-none filter drop-shadow-2xl z-20 animate-bounce ${
            post.type === 'text' 
              ? 'bottom-3 right-6 text-5xl' 
              : 'bottom-4 right-4 text-6xl bg-black/80 p-2.5 rounded-2xl border border-[#D4AF37]/10'
          }`}>
            {post.sticker}
          </div>
        )}
      </div>

      {/* Post Description / Caption (Only for media posts) */}
      {post.type !== 'text' && post.content && (
        <div className="px-5 pt-3.5 pb-2">
          <p className="text-sm text-gray-300 leading-relaxed">
            <span className="font-bold text-white mr-2">@{post.username}</span>
            {post.content}
          </p>
        </div>
      )}

      {/* Action Buttons (Like / Comment) */}
      <div className="px-5 py-3.5 border-t border-black/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1.5 group text-gray-400 hover:text-[#D4AF37] transition-colors"
            id={`like-btn-${post.id}`}
          >
            <Heart
              className={`w-5 h-5 transition-transform group-active:scale-125 ${
                isLikedByMe ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-400'
              }`}
            />
            <span className={`text-xs font-semibold ${isLikedByMe ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
              {post.likes.length}
            </span>
          </button>

          {/* Comment Count Trigger */}
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-semibold">{post.comments.length}</span>
          </button>
        </div>

        {/* Likes summary text */}
        {post.likes.length > 0 && (
          <div className="text-[10px] text-gray-500 font-mono">
            Liked by{' '}
            <span className="font-semibold text-gray-300">
              {isLikedByMe
                ? `you${post.likes.length > 1 ? ` and ${post.likes.length - 1} others` : ''}`
                : post.likes[0] + (post.likes.length > 1 ? ` and ${post.likes.length - 1} others` : '')}
            </span>
          </div>
        )}
      </div>

      {/* Comments Area */}
      <div className="px-5 pb-5 border-t border-black/10 bg-black/10">
        {/* Comments list */}
        {post.comments.length > 0 && (
          <div className="pt-3 space-y-2.5 max-h-56 overflow-y-auto">
            {/* Toggle view all comments */}
            {post.comments.length > 2 && !showAllComments && (
              <button
                type="button"
                onClick={() => setShowAllComments(true)}
                className="text-xs text-[#D4AF37] hover:text-[#AA7C11] font-medium"
              >
                View all {post.comments.length} comments
              </button>
            )}

            {(showAllComments ? post.comments : post.comments.slice(-2)).map((comment) => (
              <div key={comment.id} className="text-xs flex items-start gap-2 animate-fade-in">
                <span className="font-bold text-white whitespace-nowrap">@{comment.username}</span>
                <span className="text-gray-300 leading-relaxed flex-1">{comment.text}</span>
                <span className="text-[9px] text-gray-600 font-mono mt-0.5">
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Comment input form */}
        <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment for the brothers..."
            className="flex-1 bg-black/60 focus:bg-[#1A1A1A] border border-[#222] focus:border-[#D4AF37]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-white transition-colors placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmittingComment}
            className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors disabled:opacity-30 flex items-center justify-center border border-[#D4AF37]/25 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
