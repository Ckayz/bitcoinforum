'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { User, Calendar, MessageSquare, FileText, Crown, Shield, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Activity {
  id: string;
  type: 'thread' | 'comment';
  title: string;
  created_at: string;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);

      // Fetch recent threads
      const { data: threads } = await supabase
        .from('threads')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activity: Activity[] = [
        ...(threads || []).map(t => ({
          id: t.id,
          type: 'thread' as const,
          title: t.title,
          created_at: t.created_at
        })),
        ...(comments || []).map(c => ({
          id: c.id,
          type: 'comment' as const,
          title: c.content.substring(0, 50) + '...',
          created_at: c.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-500';
      case 'moderator': return 'text-blue-500';
      case 'verified': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="lg">
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-zinc-800 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-zinc-800 rounded w-32"></div>
                <div className="h-4 bg-zinc-800 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {userProfile?.username || 'Unknown User'}
                  </h3>
                  {getRoleIcon(userProfile?.role)}
                </div>
                <p className="text-gray-400 mb-2">{user?.email}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(userProfile?.created_at || Date.now()), { addSuffix: true })}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getRoleColor(userProfile?.role)}`}>
                    {getRoleIcon(userProfile?.role)}
                    <span className="capitalize">{userProfile?.role || 'User'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {userProfile?.bio && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Bio</h4>
                <p className="text-gray-400">{userProfile.bio}</p>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Activity</h4>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="mt-1">
                        {activity.type === 'thread' ? (
                          <FileText className="h-4 w-4 text-orange-500" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.type === 'thread' ? 'Created thread' : 'Posted comment'} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
