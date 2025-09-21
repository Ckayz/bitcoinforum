'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase client:', supabase);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Categories fetched:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error instanceof Error) {
        setError(`Failed to load categories: ${error.message}`);
      } else {
        setError('Failed to load categories. Please check your Supabase connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Mining') || name.includes('Nodes')) return <TrendingUp className="h-6 w-6" />;
    if (name.includes('Trading') || name.includes('Markets')) return <TrendingUp className="h-6 w-6" />;
    if (name.includes('Development')) return <MessageSquare className="h-6 w-6" />;
    return <Users className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Bitcoin className="h-16 w-16 text-orange-500" />
            <h1 className="text-5xl font-bold text-white">Bitcoin Forum</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discuss, Learn, and Build around Bitcoin. Join thousands of Bitcoiners in meaningful conversations about the future of money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer">
              Explore Categories Below
            </div>
            <Link href="/auth/signup">
              <div className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer">
                Join Community
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Discussion Categories</h2>
          <p className="text-gray-300 text-lg">
            Explore Bitcoin topics from mining to development, trading to security
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-zinc-700 rounded mb-2"></div>
                  <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                  <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Categories</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <div className="text-xs text-red-200 mb-4 text-left">
                <p><strong>Manual Setup Instructions:</strong></p>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li>Go to <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a> and create a new project</li>
                  <li>In your Supabase dashboard, click "SQL Editor"</li>
                  <li>Open the file <code>supabase/migrations/manual_setup_forum.sql</code> in your project</li>
                  <li>Copy ALL the SQL code from that file</li>
                  <li>Paste it into the SQL editor and click "Run"</li>
                  <li>Go to Settings → API and copy your Project URL and anon key</li>
                  <li>Add them to your <code>.env.local</code> file</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchCategories();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md mx-auto">
              <Bitcoin className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Categories Found</h3>
              <p className="text-gray-300 mb-4">
                It looks like the forum categories haven't been set up yet.
              </p>
              <button 
                onClick={() => {
                  setLoading(true);
                  fetchCategories();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500 transition-colors cursor-pointer group h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="text-orange-500 group-hover:scale-110 transition-transform">
                        {getCategoryIcon(category.name)}
                      </div>
                      <CardTitle className="text-white group-hover:text-orange-500 transition-colors">
                        ₿ {category.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 line-clamp-3">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-gray-300">Active Community</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">∞</div>
              <div className="text-gray-300">Learning Opportunities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">₿</div>
              <div className="text-gray-300">Bitcoin Focused</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}