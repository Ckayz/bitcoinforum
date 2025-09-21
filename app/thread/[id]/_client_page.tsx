'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bitcoin, MessageSquare, Clock, User, Plus, ArrowLeft, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequired } from '@/components/AuthRequired';
import { Navbar } from '@/components/Navbar';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  category_id: string;
  categories: {
    name: string;
  };
  users: {
    username: string;
  };
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    username: string;
  };
  likes: {
    id: string;
    user_id: string;
  }[];
}

interface ClientThreadPageProps {
  threadId: string;
}

export function ClientThreadPage({ threadId }: ClientThreadPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (threadId) {
      fetchThreadAndPosts();
    }
  }, [threadId]);

  const fetchThreadAndPosts = async () => {
    try {
      console.log('Fetching thread and posts for ID:', threadId);

      // Fetch thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          id,
          title,
          created_at,
          user_id,
          category_id,
          categories!threads_category_id_fkey (name),
          users!threads_user_id_fkey (username)
        `)
        .eq('id', threadId)
        .single();

      if (threadError) {
        console.error('Thread error:', threadError);
        throw threadError;
      }
      console.log('Thread data:', threadData);
      setThread(threadData);

      // Fetch posts with user info and likes
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!posts_user_id_fkey (username),
          likes!likes_post_id_fkey (id, user_id)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (postsError) {
        console.error('Posts error:', postsError);
        throw postsError;
      }
      console.log('Posts data:', postsData);
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = () => {
    if (!user) {
      setShowAuthRequired(true);
      return;
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !thread) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            thread_id: thread.id,
            user_id: user.id,
            content: newPostContent,
          },
        ]);

      if (error) throw error;

      setNewPostContent('');
      fetchThreadAndPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      const isLiked = post?.likes.some(like => like.user_id === user.id);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              post_id: postId,
              user_id: user.id,
            },
          ]);

        if (error) throw error;
      }

      fetchThreadAndPosts(); // Refresh posts to update like counts
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
            <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Thread Not Found</h1>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Thread Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href={`/category/${thread.category_id}`}>
            <Button variant="outline" size="sm" className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {thread.categories?.name}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bitcoin className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">{thread.title}</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Started by {thread.users?.username || 'Unknown User'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{posts.length} posts</span>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6 mb-8">
          {posts.map((post, index) => (
            <Card key={post.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {post.users?.username || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {index === 0 ? 'Original Post' : `Post #${index + 1}`} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-200 mb-4 whitespace-pre-wrap">
                  {post.content}
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`text-gray-400 hover:text-red-500 ${
                      post.likes.some(like => like.user_id === user?.id) ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes.length}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Post Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Reply to Thread</CardTitle>
            <CardDescription className="text-gray-300">
              Share your thoughts on this discussion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="What are your thoughts?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                    rows={5}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-orange-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={posting}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {posting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">You need to be logged in to reply to this thread.</p>
                <Button
                  onClick={handleNewPost}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Login to Reply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthRequired
        isOpen={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
        action="Login to participate in Bitcoin discussions"
      />
    </div>
  );
}