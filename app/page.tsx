'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bitcoin, MessageSquare, Clock, Heart, Share2, Plus, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { processMentions } from '@/lib/mentions';
import { useRealtime } from '@/hooks/useRealtime';
import { Navbar } from '@/components/Navbar';
import { UserBadge } from '@/components/UserBadge';
import { ShareModal } from '@/components/modals/ShareModal';
import { Markdown } from '@/components/Markdown';
import { ValidatedMarkdown } from '@/components/ValidatedMarkdown';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MentionInput } from '@/components/MentionInput';
import { ReactionButton } from '@/components/ReactionButton';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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
  image_url?: string;
  is_anonymous?: boolean;
  users: { username: string; role?: string } | { username: string; role?: string }[] | null;
  comment_likes: { id: string }[];
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  video_url?: string;
  is_anonymous?: boolean;
  users: { username: string; role?: string } | { username: string; role?: string }[] | null;
  likes: { id: string }[];
  comments: Comment[];
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  category_id: string;
  users: { username: string; role?: string } | { username: string; role?: string }[] | null;
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
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreThreads, setHasMoreThreads] = useState(true);

  // Helper function to safely get username
  const getUsername = (users: any) => {
    if (!users) return 'Unknown';
    if (Array.isArray(users)) {
      return users[0]?.username || 'Unknown';
    }
    return users.username || 'Unknown';
  };

  // Helper function to safely get user role
  const getUserRole = (users: any) => {
    if (!users) return undefined;
    if (Array.isArray(users)) {
      return users[0]?.role;
    }
    return users.role;
  };
  const [shareModal, setShareModal] = useState<{isOpen: boolean; url: string; title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Infinite scroll fetch function
  const fetchMoreThreads = async (): Promise<boolean> => {
    const nextPage = currentPage + 1;
    const hasMore = await fetchThreads(activeTab === 'all' ? undefined : activeTab, nextPage);
    setCurrentPage(nextPage);
    return hasMore;
  };

  const { lastElementRef, isFetching } = useInfiniteScroll(fetchMoreThreads);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-refresh when page becomes visible (user returns from thread)
    const handleVisibilityChange = () => {
      if (!document.hidden && categories.length > 0) {
        // Reset and refetch threads when page becomes visible
        setCurrentPage(0);
        setThreads([]);
        if (activeTab === 'all') {
          fetchThreads();
        } else {
          fetchThreads(activeTab);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [categories, activeTab]);

  useEffect(() => {
    // Reset pagination when tab changes
    setCurrentPage(0);
    setHasMoreThreads(true);
    
    if (categories.length > 0 && activeTab === 'all') {
      fetchThreads();
    } else if (activeTab !== 'all') {
      fetchThreads(activeTab);
    }
  }, [activeTab, categories]);

  // Real-time subscriptions for threads
  useRealtime({
    table: 'threads',
    onInsert: (payload) => {
      const newThread = payload.new;
      // Add new thread to the top of the list
      setThreads(prev => [newThread, ...prev]);
    },
    onUpdate: (payload) => {
      const updatedThread = payload.new;
      setThreads(prev => prev.map(thread => 
        thread.id === updatedThread.id 
          ? { ...thread, ...updatedThread }
          : thread
      ));
    },
    onDelete: (payload) => {
      const deletedThread = payload.old;
      setThreads(prev => prev.filter(thread => thread.id !== deletedThread.id));
    }
  });

  // Real-time subscriptions for posts (to update thread previews)
  useRealtime({
    table: 'posts',
    onInsert: (payload) => {
      const newPost = payload.new;
      // Update thread's post count and latest activity
      setThreads(prev => prev.map(thread => {
        if (thread.id === newPost.thread_id) {
          return {
            ...thread,
            posts: thread.posts ? [...thread.posts, newPost] : [newPost],
            updated_at: newPost.created_at
          };
        }
        return thread;
      }));
    }
  });

  // Real-time subscriptions for comments
  useRealtime({
    table: 'comments',
    onInsert: (payload) => {
      const newComment = payload.new;
      // Update comment counts in thread previews
      setThreads(prev => prev.map(thread => {
        const threadPost = thread.posts?.[0];
        if (threadPost && threadPost.id === newComment.post_id) {
          return {
            ...thread,
            posts: [{
              ...threadPost,
              comments: [...(threadPost.comments || []), newComment]
            }]
          };
        }
        return thread;
      }));
    }
  });

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

  const fetchThreads = async (categoryId?: string, page = 0, limit = 10) => {
    try {
      let query = supabase
        .from('threads')
        .select(`
          id, title, created_at, user_id, category_id,
          users!threads_user_id_fkey(username, role),
          posts (
            id, content, created_at, user_id, image_url, video_url, is_anonymous,
            users!posts_user_id_fkey(username, role),
            likes (id),
            comments (
              id, content, created_at, user_id, image_url, is_anonymous,
              users!comments_user_id_fkey(username, role),
              comment_likes (id)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Query error:', error);
      }
      
      console.log('Fetched threads with users:', data?.[0]); // Debug log
      
      if (page === 0) {
        setThreads(data || []);
      } else {
        setThreads(prev => [...prev, ...(data || [])]);
      }
      
      return (data?.length || 0) === limit; // Return true if more data might be available
    } catch (error) {
      console.error('Error fetching threads:', error);
      return false;
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: user.id }]);
      
      if (!error) {
        // Update the threads state instead of refetching
        setThreads(prev => prev.map(thread => ({
          ...thread,
          posts: thread.posts.map(post => 
            post.id === postId 
              ? { ...post, likes: [...post.likes, { id: 'temp-' + Date.now() }] }
              : post
          )
        })));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    setCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ 
          post_id: postId, 
          user_id: user.id, 
          content: newComment[postId].trim() 
        }])
        .select()
        .single();
      
      if (!error && data) {
        // Process mentions in the new comment
        await processMentions(newComment[postId].trim(), user.id, undefined, data.id);
        
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        fetchThreads(activeTab === 'all' ? undefined : activeTab);
      }
    } catch (error) {
      console.error('Error commenting:', error);
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    setThreads([]);
    if (activeTab === 'all') {
      fetchThreads();
    } else {
      fetchThreads(activeTab);
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

        {/* Posts Feed Header with New Thread and Refresh */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Latest Discussions</h2>
          <div className="flex items-center space-x-3">
            {user && (
              <Link href="/new-thread">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  New Thread
                </Button>
              </Link>
            )}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
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
                        <Link href={`/user/${getUsername(thread.users)}`}>
                          <UserBadge 
                            username={getUsername(thread.users)} 
                            role={getUserRole(thread.users)}
                            className="text-sm hover:text-orange-400"
                          />
                        </Link>
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
                        {/* Post Author */}
                        <div className="flex items-center space-x-2 mb-3">
                          <UserBadge 
                            username={getUsername(thread.posts[0].users)} 
                            role={getUserRole(thread.posts[0].users)}
                            isAnonymous={thread.posts[0].is_anonymous}
                            className="text-sm"
                          />
                          <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(thread.posts[0].created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="text-gray-300 mb-3 line-clamp-3">
                          <ValidatedMarkdown content={thread.posts[0].content} />
                        </div>
                        
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
                            <ReactionButton postId={thread.posts[0].id} />
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
                                        username={getUsername(comment.users)} 
                                        role={getUserRole(comment.users)}
                                        isAnonymous={comment.is_anonymous}
                                        className="text-xs"
                                      />
                                      <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                      <ValidatedMarkdown content={comment.content} />
                                    </div>
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
                              <div className="space-y-2">
                                <MentionInput
                                  value={newComment[thread.posts[0].id] || ''}
                                  onChange={(value) => setNewComment(prev => ({ ...prev, [thread.posts[0].id]: value }))}
                                  placeholder="Write a comment..."
                                  className="bg-zinc-700 border-zinc-600 text-white text-sm rounded-md p-2 w-full resize-none"
                                />
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => handleComment(thread.posts[0].id)}
                                    disabled={commenting[thread.posts[0].id] || !newComment[thread.posts[0].id]?.trim()}
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600"
                                  >
                                    {commenting[thread.posts[0].id] ? '...' : 'Post'}
                                  </Button>
                                </div>
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
          
          {/* Infinite scroll trigger */}
          {threads.length > 0 && (
            <div ref={lastElementRef} className="py-4">
              {isFetching && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading more threads...</p>
                </div>
              )}
            </div>
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
