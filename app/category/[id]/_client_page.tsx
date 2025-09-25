'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Bitcoin, MessageSquare, Clock, User, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequired } from '@/components/AuthRequired';
import { Navbar } from '@/components/Navbar';
import { formatDistanceToNow } from 'date-fns';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  is_anonymous?: boolean;
  users: {
    username: string;
  }[] | null;
  posts: {
    id: string;
  }[];
}

interface ClientCategoryPageProps {
  categoryId: string;
}

export function ClientCategoryPage({ categoryId }: ClientCategoryPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadImage, setNewThreadImage] = useState('');
  const [newThreadVideo, setNewThreadVideo] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndThreads();
    }
  }, [categoryId]);

  const fetchCategoryAndThreads = async () => {
    try {
      console.log('Fetching category and threads for ID:', categoryId);

      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        console.error('Category error:', categoryError);
        throw categoryError;
      }
      console.log('Category data:', categoryData);
      setCategory(categoryData);

      // Fetch threads with user info and post count
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          id,
          title,
          created_at,
          user_id,
          users (username),
          posts (id)
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (threadsError) {
        console.error('Threads error:', threadsError);
        throw threadsError;
      }
      console.log('Threads data:', threadsData);
      setThreads(threadsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = () => {
    if (!user) {
      setShowAuthRequired(true);
      return;
    }
    
    // Check if this is News category and user is not verified
    if (category?.name === 'News' && user.user_metadata?.role !== 'verified') {
      alert('Only verified users can post in the News section.');
      return;
    }
    
    setShowNewThread(true);
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) return;

    setCreating(true);
    try {
      // Create thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .insert([
          {
            category_id: category.id,
            user_id: user.id,
            title: newThreadTitle,
            is_anonymous: isAnonymous,
          },
        ])
        .select()
        .single();

      if (threadError) throw threadError;

      // Create first post
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            thread_id: threadData.id,
            user_id: user.id,
            content: newThreadContent,
            image_url: newThreadImage || null,
            video_url: newThreadVideo || null,
            is_anonymous: isAnonymous,
          },
        ]);

      if (postError) throw postError;

      // Redirect to new thread
      router.push(`/thread/${threadData.id}`);
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setCreating(false);
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
      if (url) setNewThreadImage(url);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = await uploadFile(file);
      if (url) setNewThreadVideo(url);
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
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
        {/* Category Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Bitcoin className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            </div>
            <p className="text-gray-300">{category.description}</p>
          </div>
          <Button
            onClick={handleNewThread}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </div>

        {/* New Thread Form */}
        {showNewThread && (
          <Card className="bg-zinc-900 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create New Thread</CardTitle>
              <CardDescription className="text-gray-300">
                Start a new discussion in {category.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <Input
                    placeholder="Thread title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="What would you like to discuss?"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    required
                    rows={5}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-orange-500"
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-300">
                    Post anonymously
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="thread-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('thread-image-upload')?.click()}
                      disabled={uploading}
                      className="w-full border-zinc-700 text-gray-300 hover:bg-zinc-800"
                    >
                      📷 {uploading ? 'Uploading...' : 'Add Image'}
                    </Button>
                    {newThreadImage && <p className="text-xs text-green-400">✓ Image selected</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="thread-video-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('thread-video-upload')?.click()}
                      disabled={uploading}
                      className="w-full border-zinc-700 text-gray-300 hover:bg-zinc-800"
                    >
                      🎥 {uploading ? 'Uploading...' : 'Add Video'}
                    </Button>
                    {newThreadVideo && <p className="text-xs text-green-400">✓ Video selected</p>}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {creating ? 'Creating...' : 'Create Thread'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewThread(false)}
                    className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Threads List */}
        <div className="space-y-4">
          {threads.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No threads yet</h3>
                <p className="text-gray-300 mb-4">
                  Be the first to start a discussion in {category.name}
                </p>
                <Button
                  onClick={handleNewThread}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create First Thread
                </Button>
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 hover:text-orange-500 transition-colors">
                          {thread.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>
                              {thread.users?.[0]?.username || 'Unknown User'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{thread.posts?.length || 0} posts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <AuthRequired
        isOpen={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
        action="Login to start a Bitcoin conversation"
      />
    </div>
  );
}
