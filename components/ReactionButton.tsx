'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { createReactionNotification } from '@/lib/notifications';

interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
}

interface ReactionButtonProps {
  postId?: string;
  commentId?: string;
  className?: string;
}

const REACTION_TYPES = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'dislike', emoji: '👎', label: 'Dislike' },
  { type: 'rocket', emoji: '🚀', label: 'To the Moon!' },
  { type: 'diamond', emoji: '💎', label: 'Diamond Hands' },
  { type: 'chart_up', emoji: '📈', label: 'Pump' },
  { type: 'chart_down', emoji: '📉', label: 'Dump' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'heart', emoji: '❤️', label: 'Love' },
];

export function ReactionButton({ postId, commentId, className = '' }: ReactionButtonProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch reactions
  const fetchReactions = async () => {
    const query = supabase
      .from('reactions')
      .select('id, reaction_type, user_id');

    if (postId) {
      query.eq('post_id', postId);
    } else if (commentId) {
      query.eq('comment_id', commentId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setReactions(data);
      
      // Find user's reaction
      const userReactionData = data.find(r => r.user_id === user?.id);
      setUserReaction(userReactionData?.reaction_type || null);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [postId, commentId, user]);

  // Add or update reaction
  const handleReaction = async (reactionType: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // If user already has this reaction, remove it
      if (userReaction === reactionType) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq(postId ? 'post_id' : 'comment_id', postId || commentId);

        if (!error) {
          setUserReaction(null);
        }
      } else {
        // Remove existing reaction first
        if (userReaction) {
          await supabase
            .from('reactions')
            .delete()
            .eq('user_id', user.id)
            .eq(postId ? 'post_id' : 'comment_id', postId || commentId);
        }

        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert([{
            user_id: user.id,
            post_id: postId || null,
            comment_id: commentId || null,
            reaction_type: reactionType,
          }]);

        if (!error) {
          setUserReaction(reactionType);
          
          // Create notification for post/comment author
          const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();
          
          const username = userData?.username || 'Someone';
          
          // Get post/comment author and thread info
          if (postId) {
            const { data: post } = await supabase
              .from('posts')
              .select('user_id, thread_id')
              .eq('id', postId)
              .single();
            
            if (post && post.user_id !== user.id) {
              await createReactionNotification(
                post.user_id,
                user.id,
                username,
                reactionType,
                postId,
                undefined,
                post.thread_id
              );
            }
          } else if (commentId) {
            const { data: comment } = await supabase
              .from('comments')
              .select('user_id, post_id')
              .eq('id', commentId)
              .single();
            
            if (comment && comment.user_id !== user.id) {
              const { data: post } = await supabase
                .from('posts')
                .select('thread_id')
                .eq('id', comment.post_id)
                .single();
              
              await createReactionNotification(
                comment.user_id,
                user.id,
                username,
                reactionType,
                comment.post_id,
                commentId,
                post?.thread_id
              );
            }
          }
        }
      }

      // Refresh reactions
      await fetchReactions();
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setLoading(false);
      setShowPicker(false);
    }
  };

  // Group reactions by type with counts
  const reactionCounts = REACTION_TYPES.map(reactionType => {
    const count = reactions.filter(r => r.reaction_type === reactionType.type).length;
    return { ...reactionType, count };
  }).filter(r => r.count > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Reaction Counts */}
      <div className="flex items-center space-x-2">
        {reactionCounts.map(reaction => (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            disabled={loading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
              userReaction === reaction.type
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white border border-transparent'
            }`}
            title={`${reaction.label} (${reaction.count})`}
          >
            <span className="text-sm">{reaction.emoji}</span>
            <span className="font-semibold">{reaction.count}</span>
          </button>
        ))}

        {/* Add Reaction Button */}
        {user && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
              showPicker 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white hover:scale-105'
            }`}
            title="Add reaction"
          >
            <span className={`text-sm font-bold transition-transform duration-200 ${
              showPicker ? 'rotate-45' : ''
            }`}>
              +
            </span>
          </button>
        )}
      </div>

      {/* Reaction Picker */}
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl z-50 min-w-[280px]">
          {/* Header */}
          <div className="text-xs text-gray-400 mb-2 font-medium">Choose a reaction</div>
          
          {/* Reactions Grid */}
          <div className="grid grid-cols-4 gap-2">
            {REACTION_TYPES.map(reaction => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                disabled={loading}
                className={`group relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-zinc-800 hover:scale-105 ${
                  userReaction === reaction.type 
                    ? 'bg-orange-500/20 border border-orange-500/30' 
                    : 'hover:bg-zinc-800'
                }`}
                title={reaction.label}
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
                  {reaction.emoji}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors duration-200 text-center leading-tight">
                  {reaction.label}
                </span>
                
                {/* Active indicator */}
                {userReaction === reaction.type && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-zinc-900"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Footer tip */}
          <div className="text-xs text-gray-500 mt-3 text-center">
            Click again to remove reaction
          </div>
        </div>
      )}

      {/* Click outside to close picker */}
      {showPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
