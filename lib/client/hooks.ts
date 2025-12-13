/**
 * Client-side hooks using new API client
 * Updated hooks for Phase 9
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from './api-services';
import { ResponseData } from './http-client';

export interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retries?: number;
  cacheTime?: number;
}

/**
 * Generic async data hook
 */
export function useAsyncData<T = any>(
  fn: () => Promise<ResponseData<T>>,
  options: UseAsyncOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fn();

      if (result.success) {
        setData(result.data || null);
        options.onSuccess?.(result.data);
      } else {
        const err = new Error(result.error?.message || 'Unknown error');
        setError(err);
        options.onError?.(err);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fn, options]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * Mutation hook for POST/PUT/DELETE operations
 */
export function useMutation<T = any>(
  fn: (data: any) => Promise<ResponseData<T>>,
  options: UseAsyncOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (payload: any) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn(payload);

        if (result.success) {
          setData(result.data || null);
          options.onSuccess?.(result.data);
        } else {
          const err = new Error(result.error?.message || 'Unknown error');
          setError(err);
          options.onError?.(err);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fn, options]
  );

  return { data, loading, error, mutate: execute };
}

/**
 * Quiz details hook
 */
export function useQuizDetails(quizId: string, options?: UseAsyncOptions) {
  return useAsyncData(
    () => apiClient.get(`/quizzes/${quizId}/details`),
    options
  );
}

/**
 * Questions for quiz hook
 */
export function useQuizQuestions(
  quizId: string,
  params?: { page?: number; limit?: number },
  options?: UseAsyncOptions
) {
  return useAsyncData(
    () =>
      apiClient.get(`/questions`, {
        params: { quizId, ...params },
      }),
    options
  );
}

/**
 * Attempt hook
 */
export function useAttempt(attemptId: string, options?: UseAsyncOptions) {
  return useAsyncData(
    () => apiClient.get(`/attempts/${attemptId}`),
    options
  );
}

/**
 * User results hook
 */
export function useUserResults(
  params?: { page?: number; limit?: number },
  options?: UseAsyncOptions
) {
  return useAsyncData(
    () => apiClient.get('/results', { params }),
    options
  );
}

/**
 * Bookmarks hook
 */
export function useBookmarks(
  params?: { page?: number; limit?: number },
  options?: UseAsyncOptions
) {
  return useAsyncData(
    () => apiClient.get('/bookmarks', { params }),
    options
  );
}

/**
 * Watchlist hook
 */
export function useWatchlist(
  params?: { page?: number; limit?: number },
  options?: UseAsyncOptions
) {
  return useAsyncData(
    () => apiClient.get('/watchlist', { params }),
    options
  );
}

/**
 * Add answer to attempt hook
 */
export function useSubmitAnswer(attemptId: string, options?: UseAsyncOptions) {
  return useMutation(
    (data) => apiClient.post(`/attempts/${attemptId}/answers`, data),
    options
  );
}

/**
 * Create attempt hook
 */
export function useCreateAttempt(options?: UseAsyncOptions) {
  return useMutation(
    (data) => apiClient.post('/attempts', data),
    options
  );
}

/**
 * Update bookmark hook
 */
export function useToggleBookmark(options?: UseAsyncOptions) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (quizId: string, questionId?: string) => {
      setLoading(true);

      try {
        if (isBookmarked) {
          // Remove bookmark
          await apiClient.delete(`/bookmarks/${quizId}`);
          setIsBookmarked(false);
        } else {
          // Add bookmark
          await apiClient.post('/bookmarks', { quizId, questionId });
          setIsBookmarked(true);
        }

        options?.onSuccess?.({ isBookmarked: !isBookmarked });
      } catch (error) {
        options?.onError?.(error instanceof Error ? error : new Error('Error'));
      } finally {
        setLoading(false);
      }
    },
    [isBookmarked, options]
  );

  return { isBookmarked, loading, toggle: execute };
}

/**
 * Complete attempt hook
 */
export function useCompleteAttempt(options?: UseAsyncOptions) {
  return useMutation(
    (attemptId: string) => apiClient.put(`/attempts/${attemptId}/complete`, {}),
    options
  );
}
