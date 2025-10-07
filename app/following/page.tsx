'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ValidatedMarkdown } from '@/components/ValidatedMarkdown';
import { ReactionButton } from '@/components/ReactionButton';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  Heart,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface FollowingActivity {
  id: string;
  type: 'post' | 'comment' | 'reaction';
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  thread_id: string;
  thread_title: string;
  post_id?: string;
  comment_id?: string;
}

export default function FollowingPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<FollowingActivity[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowingActivity();
      fetchFollowingCount();
    }
  }, [user]);

  const fetchFollowingCount = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    setFollowingCount(count || 0);
  };

  const fetchFollowingActivity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get users that current user follows
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!following || following.length === 0) {
        setActivities([]);
        return;
      }

      const followingIds = following.map(f => f.following_id);

      // Get recent activity from followed users
      const { data: activityData } = await supabase
        .from('user_activity')
        .select(`
          *,
          users!user_activity_user_id_fkey (username, avatar_url)
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityData) {
        const formattedActivities = activityData.map((activity: any) => ({
          id: activity.activity_id,
          type: activity.activity_type,
          content: activity.content,
          created_at: activity.created_at,
          user_id: activity.user_id,
          username: activity.users?.username || 'Unknown',
          avatar_url: activity.users?.avatar_url,
          thread_id: activity.thread_id,
          thread_title: activity.thread_title,
          post_id: activity.post_id,
          comment_id: activity.comment_id
        }));

        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching following activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'reaction': return <Heart className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: FollowingActivity) => {
    switch (activity.type) {
      case 'post':
        return `posted in "${activity.thread_title}"`;
      case 'comment':
        return `commented on "${activity.thread_title}"`;
      case 'reaction':
        return `reacted to "${activity.thread_title}"`;
      default:
        return 'had activity';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to see your following feed</h1>
            <Link href="/auth/login">
              <Button>Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold">Following Feed</h1>
              <p className="text-gray-400">Activity from {followingCount} people you follow</p>
            </div>
          </div>
          
          <Link href="/discover">
            <Button variant="outline" className="border-zinc-700">
              <TrendingUp className="h-4 w-4 mr-2" />
              Discover Users
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : followingCount === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">You're not following anyone yet</h3>
              <p className="text-gray-400 mb-4">
                Start following interesting people to see their activity here
              </p>
              <Link href="/discover">
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Discover Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : activities.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recent activity</h3>
              <p className="text-gray-400">
                The people you follow haven't been active recently
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={`${activity.type}-${activity.id}`} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Link href={`/user/${activity.username}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activity.avatar_url} alt={activity.username} />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {activity.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      {/* Activity Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        {getActivityIcon(activity.type)}
                        <Link 
                          href={`/user/${activity.username}`}
                          className="font-semibold text-white hover:text-orange-400"
                        >
                          {activity.username}
                        </Link>
                        <span className="text-gray-400 text-sm">
                          {getActivityDescription(activity)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Activity Content */}
                      {activity.type !== 'reaction' && (
                        <div className="bg-zinc-800 rounded-lg p-3 mb-3">
                          <ValidatedMarkdown 
                            content={activity.content.substring(0, 300) + (activity.content.length > 300 ? '...' : '')} 
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/thread/${activity.thread_id}`}
                          className="flex items-center space-x-1 text-sm text-gray-400 hover:text-orange-400"
                        >
                          <span>View thread</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>

                        {activity.type === 'post' && (
                          <ReactionButton postId={activity.post_id} />
                        )}
                        {activity.type === 'comment' && (
                          <ReactionButton commentId={activity.comment_id} />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
