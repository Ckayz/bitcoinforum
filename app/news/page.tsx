'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { Bitcoin, MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  users: {
    username: string;
    role?: string;
  }[] | null;
  posts: {
    id: string;
    content: string;
    image_url?: string;
    video_url?: string;
  }[];
}

export default function NewsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsThreads();
  }, []);

  const fetchNewsThreads = async () => {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('name', 'News')
        .single();

      if (!categories) {
        setLoading(false);
        return;
      }

      const { data: threadsData } = await supabase
        .from('threads')
        .select(`
          id, title, created_at, user_id,
          users (username, role),
          posts (id, content, image_url, video_url)
        `)
        .eq('category_id', categories.id)
        .order('created_at', { ascending: false });

      setThreads(threadsData || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-zinc-800 pb-4">
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                    <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-zinc-800 p-4">
          <div className="flex items-center space-x-3">
            <Bitcoin className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold">Bitcoin News</h1>
          </div>
        </div>

        {/* News Feed */}
        <div>
          {threads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No news updates yet</p>
            </div>
          ) : (
            threads.map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`}>
                <article className="border-b border-zinc-800 p-4 hover:bg-zinc-950/50 transition-colors cursor-pointer">
                  <div className="flex space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bitcoin className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-white">
                          {thread.users?.[0]?.username || 'Bitcoin News'}
                        </span>
                        {thread.users?.[0]?.role === 'verified' && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                        </span>
                        <div className="ml-auto">
                          <MoreHorizontal className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-white font-medium mb-2 leading-tight">
                        {thread.title}
                      </h2>
                      
                      {/* Content Preview */}
                      {thread.posts && thread.posts[0] && thread.posts[0].content && (
                        <div className="text-gray-300 mb-3 leading-relaxed">
                          {thread.posts[0].content.length > 200 
                            ? thread.posts[0].content.substring(0, 200) + '...'
                            : thread.posts[0].content
                          }
                        </div>
                      )}
                      
                      {/* Media */}
                      {thread.posts?.[0]?.image_url && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-zinc-700">
                          <img 
                            src={thread.posts[0].image_url} 
                            alt="News image" 
                            className="w-full h-auto max-h-96 object-cover"
                          />
                        </div>
                      )}
                      
                      {thread.posts?.[0]?.video_url && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-zinc-700">
                          <video 
                            controls 
                            className="w-full h-auto max-h-96"
                            preload="metadata"
                          >
                            <source src={thread.posts[0].video_url} type="video/mp4" />
                          </video>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between max-w-md mt-3">
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <span className="text-sm">Reply</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-red-500/10">
                            <Heart className="h-5 w-5" />
                          </div>
                          <span className="text-sm">Like</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-green-500/10">
                            <Share2 className="h-5 w-5" />
                          </div>
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
