'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { RichTextEditor } from '@/components/RichTextEditor';
import Link from 'next/link';

export default function NewThreadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to create a thread');
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      setError('Please fill in all fields');
      return;
    }

    setPosting(true);
    setError('');

    try {
      // Create thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .insert([{
          title: title.trim(),
          user_id: user.id,
          category_id: category
        }])
        .select()
        .single();

      if (threadError) throw threadError;

      // Create first post
      const { error: postError } = await supabase
        .from('posts')
        .insert([{
          thread_id: threadData.id,
          user_id: user.id,
          content: content.trim()
        }]);

      if (postError) throw postError;

      // Redirect to the new thread
      router.push(`/thread/${threadData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    } finally {
      setPosting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-zinc-900 border-zinc-800 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Login Required</h1>
              <p className="text-gray-400 mb-6">You need to be logged in to create a new thread.</p>
              <Link href="/auth/login">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Login to Continue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Create New Thread</h1>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Start a New Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Thread Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thread Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your thread about?"
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-orange-500"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
                </div>

                {/* Thread Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Message *
                  </label>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Share your thoughts, ask questions, start a discussion..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{content.length}/5000 characters</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link href="/">
                    <Button variant="outline" className="border-zinc-700 text-gray-300">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={posting || !title.trim() || !content.trim() || !category}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {posting ? 'Creating...' : 'Create Thread'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
