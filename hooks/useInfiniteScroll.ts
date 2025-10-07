import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(
  fetchMore: () => Promise<boolean>, // Returns true if more data available
  options: UseInfiniteScrollOptions = {}
) {
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { threshold = 1.0, rootMargin = '100px' } = options;

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isFetching || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsFetching(true);
          fetchMore().then((hasMoreData) => {
            setHasMore(hasMoreData);
            setIsFetching(false);
          }).catch(() => {
            setIsFetching(false);
          });
        }
      },
      { threshold, rootMargin }
    );

    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [isFetching, hasMore, fetchMore, threshold, rootMargin]);

  return { lastElementRef, isFetching, hasMore };
}
