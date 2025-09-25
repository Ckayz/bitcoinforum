'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { User, Calendar, MessageSquare, FileText, Crown, Shield, CheckCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  image_url?: string;
  video_url?: string;
  likes: { id: string }[];
  comments: { id: string }[];
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'posts'>('profile');

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

      // Fetch user posts with correct relationship names
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          image_url,
          video_url,
          likes(id),
          comments(id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        setUserPosts([]);
      } else {
        console.log('Fetched posts:', posts);
        setUserPosts(posts || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (postId: string, content: string) => {
    setEditingPost(postId);
    setEditContent(content);
  };

  const handleSaveEdit = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent })
        .eq('id', postId);

      if (error) throw error;

      setUserPosts(posts => 
        posts.map(post => 
          post.id === postId ? { ...post, content: editContent } : post
        )
      );
      setEditingPost(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      console.log('Deleting post:', postId);
      
      // Get comments first, then delete their likes
      const { data: comments } = await supabase
        .from('comments')
        .select('id')
        .eq('post_id', postId);
      
      if (comments && comments.length > 0) {
        const commentIds = comments.map(c => c.id);
        await supabase
          .from('comment_likes')
          .delete()
          .in('comment_id', commentIds);
      }
      
      // Delete comments
      await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId);
      
      // Delete post likes
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId);
      
      // Delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);
      
      if (error) throw error;

      // Update local state and refresh
      setUserPosts(posts => posts.filter(post => post.id !== postId));
      alert('Post deleted successfully!');
      onClose();
      window.location.reload();
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post: ' + (error?.message || 'Unknown error'));
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
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-zinc-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            My Posts ({userPosts.length})
          </button>
        </div>

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
          <>
            {activeTab === 'profile' && (
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
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No posts yet</p>
                ) : (
                  userPosts.map((post) => (
                    <div key={post.id} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPost(post.id, post.content)}
                            className="text-gray-400 hover:text-orange-500 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {editingPost === post.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bg-zinc-700 border-zinc-600 text-white"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSaveEdit(post.id)}
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingPost(null)}
                              size="sm"
                              variant="outline"
                              className="border-zinc-600 text-gray-300"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-300 mb-3">{post.content}</p>
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt="Post image"
                              className="rounded-lg max-w-full h-auto mb-3"
                            />
                          )}
                          {post.video_url && (
                            <video
                              src={post.video_url}
                              controls
                              className="rounded-lg max-w-full h-auto mb-3"
                            />
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{post.likes.length} likes</span>
                            <span>{post.comments.length} comments</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
