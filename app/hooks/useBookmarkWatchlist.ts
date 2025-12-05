import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

export const useBookmarkWatchlist = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBookmark = useCallback(
    async (quizId: string, isBookmarked: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            quizId,
            action: isBookmarked ? 'remove' : 'add',
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to update bookmark');
        }

        return !isBookmarked;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Bookmark error:', err);
        return isBookmarked;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const toggleWatchlist = useCallback(
    async (quizId: string, isInWatchlist: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            quizId,
            action: isInWatchlist ? 'remove' : 'add',
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to update watchlist');
        }

        return !isInWatchlist;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Watchlist error:', err);
        return isInWatchlist;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/bookmarks', { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      return data.data?.bookmarks || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Get bookmarks error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/watchlist', { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      return data.data?.watchlist || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Get watchlist error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    toggleBookmark,
    toggleWatchlist,
    getBookmarks,
    getWatchlist,
    loading,
    error,
  };
};
