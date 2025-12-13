/**
 * Integration Tests - Complete End-to-End User Journey
 */

import { describe, it, expect } from '@jest/globals';
import {
  authApi,
  userApi,
  categoryApi,
  quizApi,
  questionApi,
  attemptApi,
  resultApi,
  bookmarkApi,
} from '@/lib/client';

describe('Complete User Journey - End-to-End', () => {
  let userId: string;
  let categoryId: string;
  let quizId: string;
  let attemptId: string;

  describe('1. User Registration and Authentication', () => {
    it('should handle complete auth flow', async () => {
      // Register
      const registerResult = await authApi.register({
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        fullName: 'Test User',
      });

      expect(registerResult.success).toBe(true);
      expect(registerResult.data).toHaveProperty('user');
      expect(registerResult.data).toHaveProperty('accessToken');

      userId = registerResult.data.user.id;

      // Get profile
      const profileResult = await userApi.getProfile();
      expect(profileResult.success).toBe(true);
      expect(profileResult.data.id).toBe(userId);
    });
  });

  describe('2. Browse Categories and Quizzes', () => {
    it('should fetch categories', async () => {
      const result = await categoryApi.getCategories();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        categoryId = result.data[0].id;
      }
    });

    it('should get quizzes in category', async () => {
      if (!categoryId) {
        skip();
      }

      const result = await quizApi.getQuizzesByCategory(categoryId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        quizId = result.data[0].id;
      }
    });
  });

  describe('3. Take Quiz', () => {
    it('should get quiz details', async () => {
      if (!quizId) {
        skip();
      }

      const result = await quizApi.getQuizById(quizId);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(quizId);
      expect(result.data.questionCount).toBeGreaterThan(0);
    });

    it('should get quiz questions', async () => {
      if (!quizId) {
        skip();
      }

      const result = await questionApi.getQuestionsByQuiz(quizId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should create attempt', async () => {
      if (!quizId) {
        skip();
      }

      const result = await attemptApi.createAttempt({
        quizId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data.status).toBe('in_progress');

      attemptId = result.data.id;
    });
  });

  describe('4. Submit Answers', () => {
    it('should submit quiz answers and complete', async () => {
      if (!attemptId || !quizId) {
        skip();
      }

      // Get questions
      const questionsResult = await questionApi.getQuestionsByQuiz(quizId);
      expect(questionsResult.success).toBe(true);

      const questions = questionsResult.data;
      const answers = questions.map((q) => ({
        questionId: q.id,
        answer: q.options?.[0] || 'answer1', // Select first option
      }));

      // Submit attempt
      const submitResult = await attemptApi.submitAttempt({
        attemptId,
        answers,
      });

      expect(submitResult.success).toBe(true);
      expect(submitResult.data.status).toBe('completed');
    });
  });

  describe('5. View Results', () => {
    it('should get attempt details with results', async () => {
      if (!attemptId) {
        skip();
      }

      const result = await attemptApi.getAttemptById(attemptId);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(attemptId);
      expect(result.data.score).toBeDefined();
      expect(result.data.status).toBe('completed');
    });

    it('should get user results', async () => {
      const result = await resultApi.getUserResults();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('6. Bookmark and Organize', () => {
    it('should bookmark completed quiz', async () => {
      if (!quizId) {
        skip();
      }

      const result = await bookmarkApi.addBookmark({ quizId });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });

    it('should retrieve bookmarks', async () => {
      const result = await bookmarkApi.getBookmarks();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Error Handling in Journey', () => {
    it('should handle quiz not found', async () => {
      const result = await quizApi.getQuizById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid attempt submission', async () => {
      const result = await attemptApi.submitAttempt({
        attemptId: 'invalid-id',
        answers: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
