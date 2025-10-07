'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/FollowButton';
import { Bitcoin, MessageSquare, Clock, User, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Navbar } from '@/components/Navbar';

interface SearchResult {
  type: 'thread' | 'post' | 'user';
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  category_name?: string;
  thread_id?: string;
  rank: number;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
}

function SearchContent() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-orange-200 text-orange-900">$1</mark>');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-400">
            Results for "{query}" ({results.length} found)
          </p>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Searching...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div className="text-center py-8">
          <p className="text-gray-400">No results found for "{query}"</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`} className="bg-zinc-900 border-zinc-800">
            {result.type === 'user' ? (
              // User Result
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={result.avatar_url} alt={result.username} />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {result.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/user/${result.username}`}
                            className="text-white hover:text-orange-500 transition-colors"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightText(result.username, query) 
                            }}
                          />
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400">
                            user
                          </span>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{result.followers_count || 0} followers</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Joined {formatDistanceToNow(new Date(result.created_at))} ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <FollowButton userId={result.user_id} username={result.username} />
                  </div>
                </CardHeader>
                {result.bio && (
                  <CardContent className="pt-0">
                    <p 
                      className="text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.bio, query) 
                      }}
                    />
                  </CardContent>
                )}
              </>
            ) : (
              // Thread/Post Result
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        result.type === 'thread' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {result.type}
                      </span>
                      <span className="text-sm text-gray-400">{result.category_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <User className="h-4 w-4" />
                      <Link 
                        href={`/user/${result.username}`}
                        className="hover:text-orange-400"
                      >
                        {result.username}
                      </Link>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{formatDistanceToNow(new Date(result.created_at))} ago</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/thread/${result.thread_id}`}
                      className="text-white hover:text-orange-500 transition-colors"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.title, query) 
                      }}
                    />
                  </CardTitle>
                </CardHeader>
                {result.content && (
                  <CardContent className="pt-0">
                    <p 
                      className="text-gray-300 line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(
                          result.content.length > 200 
                            ? result.content.substring(0, 200) + '...' 
                            : result.content, 
                          query
                        ) 
                      }}
                    />
                  </CardContent>
                )}
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading...</p>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
