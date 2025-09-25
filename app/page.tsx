'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bitcoin, MessageSquare, Clock, Heart, Share2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { UserBadge } from '@/components/UserBadge';
import { ShareModal } from '@/components/modals/ShareModal';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: { username: string; role?: string } | null;
  comment_likes: { id: string }[];
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  video_url?: string;
  users: { username: string; role?: string }[] | null;
  likes: { id: string }[];
  comments: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    image_url?: string;
    users: { username: string; role?: string }[] | null;
    comment_likes: { id: string }[];
  }[];
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  category_id: string;
  users: { username: string; role?: string }[] | null;
  posts: Post[];
}

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [commenting, setCommenting] = useState<{[key: string]: boolean}>({});
  const [shareModal, setShareModal] = useState<{isOpen: boolean; url: string; title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && activeTab === 'all') {
      fetchThreads();
    } else if (activeTab !== 'all') {
      fetchThreads(activeTab);
    }
  }, [activeTab, categories]);

  const fetchData = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .neq('name', 'News') // Exclude News category
        .order('created_at', { ascending: true });
      
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreads = async (categoryId?: string) => {
    try {
      let query = supabase
        .from('threads')
        .select(`
          id, title, created_at, user_id, category_id,
          users (username, role),
          posts (
            id, content, created_at, user_id, image_url, video_url,
            users (username, role),
            likes (id),
            comments (
              id, content, created_at, user_id, image_url,
              users (username, role),
              comment_likes (id)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data } = await query;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: user.id }]);
      
      if (!error) {
        fetchThreads(activeTab === 'all' ? undefined : activeTab);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    setCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ 
          post_id: postId, 
          user_id: user.id, 
          content: newComment[postId].trim() 
        }]);
      
      if (!error) {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        fetchThreads(activeTab === 'all' ? undefined : activeTab);
      }
    } catch (error) {
      console.error('Error commenting:', error);
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = (threadId: string, title: string) => {
    const url = `${window.location.origin}/thread/${threadId}`;
    setShareModal({
      isOpen: true,
      url,
      title: title || 'Bitcoin Forum Post'
    });
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-zinc-800 rounded w-1/3"></div>
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-zinc-800 rounded w-24"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Bitcoin className="h-10 w-10 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">Bitcoin Forum</h1>
          </div>
          {user && categories.length > 0 && (
            <Link href={`/category/${categories[0].id}`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </Link>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white border-b-2 border-orange-500'
                : 'text-gray-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            All Posts
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === category.id
                  ? 'bg-orange-500 text-white border-b-2 border-orange-500'
                  : 'text-gray-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {threads.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-300">Be the first to start a conversation!</p>
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => (
              <Card key={thread.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/thread/${thread.id}`}>
                        <CardTitle className="text-white hover:text-orange-500 transition-colors cursor-pointer mb-2">
                          {thread.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <UserBadge 
                          username={thread.users?.[0]?.username || 'Unknown'} 
                          role={thread.users?.[0]?.role}
                          className="text-sm"
                        />
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{thread.posts?.length || 0} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Show first post (original post) */}
                  {thread.posts && thread.posts.length > 0 && (
                    <div className="mb-4">
                      <div className="bg-zinc-800 rounded-lg p-4">
                        <p className="text-gray-300 mb-3 line-clamp-3">{thread.posts[0].content}</p>
                        
                        {/* Media Display */}
                        {thread.posts[0].image_url && (
                          <div className="mb-3">
                            <img src={thread.posts[0].image_url} alt="Post image" className="max-w-full h-48 object-cover rounded" />
                          </div>
                        )}
                        
                        {thread.posts[0].video_url && (
                          <div className="mb-3">
                            <video controls className="max-w-full h-48 rounded">
                              <source src={thread.posts[0].video_url} type="video/mp4" />
                            </video>
                          </div>
                        )}
                        
                        {/* Interaction buttons */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleLike(thread.posts[0].id)}
                              className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                              <span>{thread.posts[0].likes?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => toggleComments(thread.posts[0].id)}
                              className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{thread.posts[0].comments?.length || 0}</span>
                              {expandedComments.has(thread.posts[0].id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <button className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors"
                              onClick={() => handleShare(thread.id, thread.title)}>
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>

                        {/* Comments Section */}
                        {expandedComments.has(thread.posts[0].id) && (
                          <div className="border-t border-zinc-700 pt-4">
                            {/* Show top 3 comments */}
                            {thread.posts[0].comments && thread.posts[0].comments.length > 0 && (
                              <div className="space-y-3 mb-4">
                                {thread.posts[0].comments.slice(0, 3).map((comment) => (
                                  <div key={comment.id} className="bg-zinc-700 rounded p-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <UserBadge 
                                        username={comment.users?.username || 'Unknown'} 
                                        role={comment.users?.role}
                                        className="text-xs"
                                      />
                                      <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 text-sm">{comment.content}</p>
                                    {comment.image_url && (
                                      <img src={comment.image_url} alt="Comment image" className="max-w-xs h-auto rounded mt-2" />
                                    )}
                                  </div>
                                ))}
                                {thread.posts[0].comments.length > 3 && (
                                  <p className="text-sm text-gray-400 text-center">
                                    +{thread.posts[0].comments.length - 3} more comments
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Add comment */}
                            {user && (
                              <div className="flex space-x-2">
                                <Textarea
                                  placeholder="Write a comment..."
                                  value={newComment[thread.posts[0].id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [thread.posts[0].id]: e.target.value }))}
                                  rows={2}
                                  className="bg-zinc-700 border-zinc-600 text-white text-sm"
                                />
                                <Button
                                  onClick={() => handleComment(thread.posts[0].id)}
                                  disabled={commenting[thread.posts[0].id] || !newComment[thread.posts[0].id]?.trim()}
                                  size="sm"
                                  className="bg-orange-500 hover:bg-orange-600"
                                >
                                  {commenting[thread.posts[0].id] ? '...' : 'Post'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
        url={shareModal.url}
        title={shareModal.title}
      />
    </div>
  );
}
