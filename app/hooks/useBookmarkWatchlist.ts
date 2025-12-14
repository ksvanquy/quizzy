'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/client/api-services';

interface ToggleResult {
  success: boolean;
  isActive: boolean;
}

export function useBookmarkWatchlist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const toggleBookmark = async (quizId: string, currentlyBookmarked: boolean): Promise<boolean> => {
    setLoading(true);
    try {
      if (currentlyBookmarked) {
        await apiClient.delete(`/bookmarks/${quizId}`);
        return false;
      }

      await apiClient.post('/bookmarks', { quizId });
      return true;
    } catch (err: any) {
      // If already bookmarked, treat as still bookmarked to keep UI consistent
      const message = typeof err?.message === 'string' ? err.message : '';
      if (message.includes('already bookmarked')) {
        return true;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async (quizId: string, currentlyInWatchlist: boolean): Promise<boolean> => {
    setLoading(true);
    try {
      if (currentlyInWatchlist) {
        await apiClient.delete(`/watchlist/${quizId}`);
        return false;
      }

      await apiClient.post('/watchlist', { quizId });
      return true;
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : '';
      if (message.includes('already in user watchlist') || message.includes('already in watchlist')) {
        return true;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBookmarks = async (): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bookmarks');
      const data = response.data;
      return data?.items || data?.bookmarks || [];
    } finally {
      setLoading(false);
    }
  };

  const getWatchlist = async (): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await apiClient.get('/watchlist');
      const data = response.data;
      return data?.items || data?.watchlist || [];
    } finally {
      setLoading(false);
    }
  };

  return { toggleBookmark, toggleWatchlist, getBookmarks, getWatchlist, loading, error };
}

export default useBookmarkWatchlist;
