import { useState, useEffect } from 'react';

interface SearchSuggestion {
  type: 'thread' | 'post' | 'user';
  id: string;
  title: string;
  content: string;
  username: string;
  avatar_url?: string;
  thread_id?: string;
  excerpt?: string;
}

export function useSearchSuggestions(query: string, delay: number = 300) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        
        // Limit to top 8 results for dropdown
        const limitedResults = data.results?.slice(0, 8) || [];
        setSuggestions(limitedResults);
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay]);

  return { suggestions, loading };
}
