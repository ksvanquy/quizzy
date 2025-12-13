/**
 * Integration Tests - Bookmarks and Watchlist Flow
 */

import { describe, it, expect } from '@jest/globals';
import { bookmarkApi, watchlistApi, quizApi } from '@/lib/client';

describe('Bookmarks and Watchlist Flow', () => {
  let quizId: string;
  let bookmarkId: string;
  let watchlistId: string;

  beforeAll(async () => {
    const quizzes = await quizApi.getQuizzes();
    if (quizzes.data.length > 0) {
      quizId = quizzes.data[0].id;
    }
  });

  describe('Bookmarks', () => {
    it('should get user bookmarks', async () => {
      const result = await bookmarkApi.getBookmarks();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should add bookmark', async () => {
      if (!quizId) {
        skip();
      }

      const result = await bookmarkApi.addBookmark({
        quizId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');

      bookmarkId = result.data.id;
    });

    it('should check if bookmarked', async () => {
      if (!quizId) {
        skip();
      }

      const result = await bookmarkApi.isBookmarked(quizId);

      expect(result.success).toBe(true);
      expect(typeof result.data.isBookmarked).toBe('boolean');
    });

    it('should remove bookmark', async () => {
      if (!bookmarkId) {
        skip();
      }

      const result = await bookmarkApi.removeBookmark(bookmarkId);

      expect(result.success).toBe(true);
    });
  });

  describe('Watchlist', () => {
    it('should get user watchlist', async () => {
      const result = await watchlistApi.getWatchlist();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should add to watchlist', async () => {
      if (!quizId) {
        skip();
      }

      const result = await watchlistApi.addToWatchlist({
        quizId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');

      watchlistId = result.data.id;
    });

    it('should remove from watchlist', async () => {
      if (!watchlistId) {
        skip();
      }

      const result = await watchlistApi.removeFromWatchlist(watchlistId);

      expect(result.success).toBe(true);
    });

    it('should get watchlist with pagination', async () => {
      const result = await watchlistApi.getWatchlist({
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.meta?.pagination?.page).toBe(1);
    });
  });

  describe('Combined Workflow', () => {
    it('should bookmark and add to watchlist same quiz', async () => {
      if (!quizId) {
        skip();
      }

      const bookmarkResult = await bookmarkApi.addBookmark({ quizId });
      const watchlistResult = await watchlistApi.addToWatchlist({ quizId });

      expect(bookmarkResult.success).toBe(true);
      expect(watchlistResult.success).toBe(true);

      // Cleanup
      if (bookmarkResult.data?.id) {
        await bookmarkApi.removeBookmark(bookmarkResult.data.id);
      }
      if (watchlistResult.data?.id) {
        await watchlistApi.removeFromWatchlist(watchlistResult.data.id);
      }
    });
  });
});
