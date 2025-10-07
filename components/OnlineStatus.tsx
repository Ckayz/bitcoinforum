'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface OnlineStatusProps {
  userId?: string;
  showText?: boolean;
  className?: string;
}

export function OnlineStatus({ userId, showText = false, className = '' }: OnlineStatusProps) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!userId && !user) return;

    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    // Track user's online status
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: targetUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState);
        
        setOnlineCount(users.length);
        setIsOnline(users.includes(targetUserId));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user as online
          if (!userId && user) {
            await channel.track({
              user_id: user.id,
              username: user.user_metadata?.username || 'Anonymous',
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, user]);

  if (userId && !isOnline) {
    return null; // Don't show offline status for other users
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {showText && (
        <span className="text-xs text-gray-400">
          {userId ? (isOnline ? 'Online' : 'Offline') : `${onlineCount} online`}
        </span>
      )}
    </div>
  );
}
