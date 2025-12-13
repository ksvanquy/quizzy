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
    } finally {
      setLoading(false);
    }
  };

  const getBookmarks = async (): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bookmarks');
      return response.data?.items || [];
    } finally {
      setLoading(false);
    }
  };

  const getWatchlist = async (): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await apiClient.get('/watchlist');
      return response.data?.items || [];
    } finally {
      setLoading(false);
    }
  };

  return { toggleBookmark, toggleWatchlist, getBookmarks, getWatchlist, loading, error };
}

export default useBookmarkWatchlist;
