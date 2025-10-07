'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { RichTextEditor } from '@/components/RichTextEditor';
import Link from 'next/link';

export default function CreateNewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newsCategory, setNewsCategory] = useState<string | null>(null);

  // Check if user is verified and get news category
  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user) return;

      // Get user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData) {
        setUserRole(userData.role);
      }

      // Set News category ID directly
      setNewsCategory('d780a77d-8fed-446d-bc28-04c60537dc78');
    };

    checkUserPermissions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to create news posts');
      return;
    }

    if (userRole !== 'verified') {
      setError('Only verified users can post Bitcoin news');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please fill in title and content');
      return;
    }

    if (!newsCategory) {
      setError('News category not found');
      return;
    }

    setPosting(true);
    setError('');

    try {
      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert([{
          title: title.trim(),
          user_id: user.id,
          category_id: newsCategory,
          is_anonymous: false
        }])
        .select()
        .single();

      if (threadError) throw threadError;

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert([{
          content: content.trim(),
          user_id: user.id,
          thread_id: thread.id,
          image_url: imageUrl.trim() || null,
          video_url: videoUrl.trim() || null
        }]);

      if (postError) throw postError;

      // Redirect to the news page
      router.push('/news');
    } catch (error: any) {
      console.error('Error creating news post:', error);
      setError(error.message || 'Failed to create news post');
    } finally {
      setPosting(false);
    }
  };

  // Show loading while checking permissions
  if (!user || userRole === null) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if user is not verified
  if (userRole !== 'verified') {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <CardTitle className="text-red-400">Access Restricted</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Only verified users can post Bitcoin news articles. This helps maintain the quality and accuracy of news content.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                If you believe you should have verified status, please contact the administrators.
              </p>
              <div className="flex space-x-4">
                <Link href="/news">
                  <Button variant="outline" className="border-zinc-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to News
                  </Button>
                </Link>
                <Link href="/">
                  <Button>Go to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
          <div className="flex items-center space-x-4">
            <Link href="/news">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <h1 className="text-2xl font-bold">Create Bitcoin News</h1>
            </div>
          </div>
        </div>

        {/* Verified User Badge */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="text-blue-400 font-medium">Verified User</span>
            <span className="text-gray-400">• You can post official Bitcoin news</span>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>New Bitcoin News Article</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  News Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bitcoin Reaches New All-Time High Above $100,000"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/200 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Article Content *
                </label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your Bitcoin news article here. Use the toolbar for rich formatting..."
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video URL (optional)
                  </label>
                  <Input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Guidelines */}
              <div className="p-4 bg-zinc-800 rounded-lg">
                <h3 className="font-medium text-white mb-2">News Posting Guidelines</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Ensure news is accurate and from reliable sources</li>
                  <li>• Include source links when possible</li>
                  <li>• Use clear, descriptive titles</li>
                  <li>• Avoid sensationalized language</li>
                  <li>• Focus on Bitcoin-related content</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/news">
                  <Button variant="outline" className="border-zinc-700">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={posting || !title.trim() || !content.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {posting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish News
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
