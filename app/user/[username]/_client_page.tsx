'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { ValidatedMarkdown } from '@/components/ValidatedMarkdown';
import { FollowButton } from '@/components/FollowButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Globe, 
  Twitter, 
  Github, 
  Calendar,
  MessageSquare,
  FileText,
  Heart,
  Award,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  reputation: number;
  created_at: string;
  post_count: number;
  comment_count: number;
  reactions_given: number;
  reactions_received: number;
  mentions_received: number;
  followers_count: number;
  following_count: number;
}

interface Activity {
  activity_type: 'post' | 'comment' | 'reaction';
  activity_id: string;
  content: string;
  created_at: string;
  thread_title: string;
  thread_id: string;
  post_id?: string;
  comment_id?: string;
}

interface UserProfileClientProps {
  username: string;
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'comments' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.user_metadata?.username === username;

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile with stats
      const { data: profileData, error: profileError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        setError('User not found');
        return;
      }

      setProfile(profileData);

      // Fetch user activity
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!activityError && activityData) {
        setActivities(activityData);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 1000) return { level: 'Expert', color: 'bg-purple-500' };
    if (reputation >= 500) return { level: 'Advanced', color: 'bg-blue-500' };
    if (reputation >= 100) return { level: 'Intermediate', color: 'bg-green-500' };
    if (reputation >= 25) return { level: 'Beginner', color: 'bg-yellow-500' };
    return { level: 'Newbie', color: 'bg-gray-500' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'reaction': return <Heart className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'post':
        return `Posted in "${activity.thread_title}"`;
      case 'comment':
        return `Commented on "${activity.thread_title}"`;
      case 'reaction':
        return `Reacted with ${activity.content} to "${activity.thread_title}"`;
      default:
        return 'Unknown activity';
    }
  };

  const getActivityLink = (activity: Activity) => {
    return `/thread/${activity.thread_id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-gray-400">The user "{username}" does not exist.</p>
            <Link href="/">
              <Button className="mt-4">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const reputationLevel = getReputationLevel(profile.reputation);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="bg-orange-500 text-white text-2xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  <Badge className={`${reputationLevel.color} text-white`}>
                    {reputationLevel.level}
                  </Badge>
                </div>

                {profile.bio && (
                  <p className="text-gray-300 mb-3">{profile.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</span>
                  </div>
                  
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:text-orange-400"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}

                  {profile.twitter && (
                    <a 
                      href={`https://twitter.com/${profile.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:text-orange-400"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>@{profile.twitter}</span>
                    </a>
                  )}

                  {profile.github && (
                    <a 
                      href={`https://github.com/${profile.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:text-orange-400"
                    >
                      <Github className="h-4 w-4" />
                      <span>{profile.github}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {/* Follow Button */}
                <FollowButton 
                  userId={profile.id} 
                  username={profile.username}
                />
                
                {/* Edit Profile Button */}
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="outline" className="border-zinc-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{profile.reputation}</div>
              <div className="text-sm text-gray-400">Reputation</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{profile.followers_count}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{profile.following_count}</div>
              <div className="text-sm text-gray-400">Following</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-500">{profile.post_count}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{profile.comment_count}</div>
              <div className="text-sm text-gray-400">Comments</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-500">{profile.reactions_received}</div>
              <div className="text-sm text-gray-400">Reactions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{profile.mentions_received}</div>
              <div className="text-sm text-gray-400">Mentions</div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Link
                    key={`${activity.activity_type}-${activity.activity_id}`}
                    href={getActivityLink(activity)}
                    className="block p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {getActivityDescription(activity)}
                        </p>
                        {activity.activity_type !== 'reaction' && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {activity.content.substring(0, 150)}
                            {activity.content.length > 150 ? '...' : ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
