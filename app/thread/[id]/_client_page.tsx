'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Bitcoin, MessageSquare, Clock, User, ArrowLeft, Heart, Image, Video, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequired } from '@/components/AuthRequired';
import { Navbar } from '@/components/Navbar';
import { ShareModal } from '@/components/modals/ShareModal';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  category_id: string;
  categories: { name: string; }[] | null;
  users: { username: string; } | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  users: { username: string; } | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  video_url?: string;
  users: { username: string; } | null;
  likes: { id: string; user_id: string; }[];
  comments?: Comment[];
}

interface ClientThreadPageProps {
  threadId: string;
}

export function ClientThreadPage({ threadId }: ClientThreadPageProps) {
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newCommentContent, setNewCommentContent] = useState<{[key: string]: string}>({});
  const [newCommentImage, setNewCommentImage] = useState<{[key: string]: string}>({});
  const [commenting, setCommenting] = useState<{[key: string]: boolean}>({});
  const [shareModal, setShareModal] = useState<{isOpen: boolean; url: string; title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    if (threadId) {
      fetchThreadAndPosts();
    }
  }, [threadId]);

  const fetchThreadAndPosts = async () => {
    try {
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          id, title, created_at, user_id, category_id,
          categories (name),
          users!threads_user_id_fkey (username)
        `)
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;
      setThread(threadData);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, content, created_at, user_id, image_url, video_url,
          users!posts_user_id_fkey (username),
          likes (id, user_id),
          comments (
            id, content, created_at, user_id, image_url,
            users!comments_user_id_fkey (username)
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !thread) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          thread_id: thread.id,
          user_id: user.id,
          content: newPostContent,
          image_url: newPostImage || null,
        }]);

      if (error) throw error;

      setNewPostContent('');
      setNewPostImage('');
      fetchThreadAndPosts();
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
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
      }

      fetchThreadAndPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
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

  const handleCreateComment = async (postId: string) => {
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    const content = newCommentContent[postId];
    if (!content?.trim()) return;

    setCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          image_url: newCommentImage[postId] || null,
        }]);

      if (error) throw error;

      setNewCommentContent(prev => ({ ...prev, [postId]: '' }));
      setNewCommentImage(prev => ({ ...prev, [postId]: '' }));
      fetchThreadAndPosts();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadFile(file);
      if (url) setNewPostImage(url);
    }
  };

  const handleCommentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, postId: string) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadFile(file);
      if (url) setNewCommentImage(prev => ({ ...prev, [postId]: url }));
    }
  };

  const handleShare = (postId: string, title: string) => {
    const url = `${window.location.origin}/thread/${threadId}#post-${postId}`;
    setShareModal({
      isOpen: true,
      url,
      title: title || thread?.title || 'Bitcoin Forum Post'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
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
        <div className="flex items-center space-x-4 mb-6">
          <Link href={`/category/${thread.category_id}`}>
            <Button variant="outline" size="sm" className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {thread.categories?.[0]?.name}
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

                {post.image_url && (
                  <div className="mb-4">
                    <img src={post.image_url} alt="Post image" className="max-w-full h-auto rounded-lg" />
                  </div>
                )}
                
                {post.video_url && (
                  <div className="mb-4">
                    <video controls className="max-w-full h-auto rounded-lg">
                      <source src={post.video_url} type="video/mp4" />
                    </video>
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-4">
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post.id)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {post.comments?.length || 0} comments
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id, post.content.substring(0, 50))}
                    className="text-gray-400 hover:text-green-500"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>

                {expandedComments.has(post.id) && (
                  <div className="border-t border-zinc-700 pt-4 mt-4">
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-zinc-800 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm font-medium text-white">
                                {comment.users?.username || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                            {comment.image_url && (
                              <img src={comment.image_url} alt="Comment image" className="max-w-xs h-auto rounded mt-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {user ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newCommentContent[post.id] || ''}
                          onChange={(e) => setNewCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          rows={2}
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-orange-500 text-sm"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCommentImageUpload(e, post.id)}
                            className="hidden"
                            id={`comment-image-${post.id}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`comment-image-${post.id}`)?.click()}
                            disabled={uploading}
                            className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
                          >
                            📷
                          </Button>
                          <Button
                            onClick={() => handleCreateComment(post.id)}
                            disabled={commenting[post.id] || !newCommentContent[post.id]?.trim()}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {commenting[post.id] ? 'Posting...' : 'Comment'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm mb-2">Login to comment</p>
                        <Button
                          onClick={() => setShowAuthRequired(true)}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Login
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

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
                <Textarea
                  placeholder="What are your thoughts?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  rows={5}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-orange-500"
                />
                
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                    className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Add Image'}
                  </Button>
                  {newPostImage && <p className="text-xs text-green-400">✓ Image selected</p>}
                </div>
                
                <Button
                  type="submit"
                  disabled={posting}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {posting ? 'Posting...' : 'Post Reply'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">You need to be logged in to reply to this thread.</p>
                <Button
                  onClick={() => setShowAuthRequired(true)}
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

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
        url={shareModal.url}
        title={shareModal.title}
      />
    </div>
  );
}
