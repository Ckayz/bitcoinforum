import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchTerm = `%${query.trim()}%`;
    
    // Search in threads
    const { data: threadResults, error: threadError } = await supabase
      .from('threads')
      .select(`
        id,
        title,
        created_at,
        user_id,
        users(username),
        categories(name)
      `)
      .ilike('title', searchTerm)
      .limit(25);

    if (threadError) {
      console.error('Thread search error:', threadError);
    }

    // Search in posts
    const { data: postResults, error: postError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        thread_id,
        users(username),
        threads(
          title,
          categories(name)
        )
      `)
      .ilike('content', searchTerm)
      .limit(25);

    if (postError) {
      console.error('Post search error:', postError);
    }

    // Search in users
    const { data: userResults, error: userError } = await supabase
      .from('user_stats')
      .select('id, username, bio, avatar_url, followers_count, created_at')
      .or(`username.ilike.${searchTerm},bio.ilike.${searchTerm}`)
      .limit(20);

    if (userError) {
      console.error('User search error:', userError);
    }

    // Format results
    const results: SearchResult[] = [];

    // Add thread results
    if (threadResults) {
      threadResults.forEach((thread: any) => {
        results.push({
          type: 'thread',
          id: thread.id,
          title: thread.title,
          content: '',
          created_at: thread.created_at,
          user_id: thread.user_id,
          username: thread.users?.username || 'Unknown',
          category_name: thread.categories?.name || 'Unknown',
          thread_id: thread.id,
          rank: 1
        });
      });
    }

    // Add post results
    if (postResults) {
      postResults.forEach((post: any) => {
        results.push({
          type: 'post',
          id: post.id,
          title: post.threads?.title || 'Unknown',
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          username: post.users?.username || 'Unknown',
          category_name: post.threads?.categories?.name || 'Unknown',
          thread_id: post.thread_id,
          rank: 1
        });
      });
    }

    // Add user results
    if (userResults) {
      userResults.forEach((user: any) => {
        results.push({
          type: 'user',
          id: user.id,
          title: user.username,
          content: user.bio || '',
          created_at: user.created_at,
          user_id: user.id,
          username: user.username,
          rank: 1,
          avatar_url: user.avatar_url,
          bio: user.bio,
          followers_count: user.followers_count
        });
      });
    }

    // Sort by created_at (newest first)
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ results: results.slice(0, 50) });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
