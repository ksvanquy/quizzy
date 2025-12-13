/**
 * Integration Tests - Quiz Flow
 */

import { describe, it, expect } from '@jest/globals';
import { categoryApi, quizApi, questionApi, attemptApi, resultApi } from '@/lib/client';

describe('Quiz Flow', () => {
  let categoryId: string;
  let quizId: string;
  let questionId: string;
  let attemptId: string;

  describe('Categories', () => {
    it('should get all categories', async () => {
      const result = await categoryApi.getCategories();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        categoryId = result.data[0].id;
      }
    });

    it('should get category by ID', async () => {
      if (!categoryId) {
        const categories = await categoryApi.getCategories();
        if (categories.data.length === 0) {
          skip();
        }
        categoryId = categories.data[0].id;
      }

      const result = await categoryApi.getCategory(categoryId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', categoryId);
      expect(result.data).toHaveProperty('name');
    });

    it('should get category by slug', async () => {
      const categories = await categoryApi.getCategories();
      if (categories.data.length === 0) {
        skip();
      }

      const slug = categories.data[0].slug || 'mathematics';
      const result = await categoryApi.getCategoryBySlug(slug);

      expect(result.success).toBe(true);
    });
  });

  describe('Quizzes', () => {
    it('should get all quizzes', async () => {
      const result = await quizApi.getQuizzes();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        quizId = result.data[0].id;
      }
    });

    it('should get quiz by ID', async () => {
      if (!quizId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        quizId = quizzes.data[0].id;
      }

      const result = await quizApi.getQuiz(quizId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', quizId);
      expect(result.data).toHaveProperty('title');
    });

    it('should get quiz details with questions', async () => {
      if (!quizId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        quizId = quizzes.data[0].id;
      }

      const result = await quizApi.getQuizDetails(quizId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('questions');
      expect(Array.isArray(result.data.questions)).toBe(true);

      if (result.data.questions.length > 0) {
        questionId = result.data.questions[0].id;
      }
    });

    it('should get quizzes with pagination', async () => {
      const result = await quizApi.getQuizzes({
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.meta?.pagination?.page).toBe(1);
    });

    it('should search quizzes by category', async () => {
      if (!categoryId) {
        const categories = await categoryApi.getCategories();
        if (categories.data.length === 0) {
          skip();
        }
        categoryId = categories.data[0].id;
      }

      const result = await quizApi.getQuizzes({
        categoryId,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Questions', () => {
    it('should get questions for quiz', async () => {
      if (!quizId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        quizId = quizzes.data[0].id;
      }

      const result = await questionApi.getQuestionsForQuiz(quizId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get question by ID', async () => {
      if (!questionId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        const details = await quizApi.getQuizDetails(quizzes.data[0].id);
        if (details.data.questions.length === 0) {
          skip();
        }
        questionId = details.data.questions[0].id;
      }

      const result = await questionApi.getQuestion(questionId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', questionId);
    });

    it('should get next question', async () => {
      if (!quizId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        quizId = quizzes.data[0].id;
      }

      const result = await questionApi.getNextQuestion(quizId, 0);

      expect(result.success).toBe(true);
    });
  });

  describe('Attempts', () => {
    it('should create quiz attempt', async () => {
      if (!quizId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        quizId = quizzes.data[0].id;
      }

      const result = await attemptApi.createAttempt({
        quizId,
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');

      attemptId = result.data.id;
    });

    it('should get attempt by ID', async () => {
      if (!attemptId) {
        skip();
      }

      const result = await attemptApi.getAttempt(attemptId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', attemptId);
    });

    it('should submit answer', async () => {
      if (!attemptId) {
        skip();
      }

      const result = await attemptApi.submitAnswer(attemptId, {
        questionId: 'test-question',
        answer: 'A',
      });

      if (result) {
        expect(result.success).toBe(true);
      }
    });

    it('should complete attempt', async () => {
      if (!attemptId) {
        skip();
      }

      const result = await attemptApi.completeAttempt(attemptId);

      expect(result.success).toBe(true);
    });
  });

  describe('Results', () => {
    it('should get attempt result', async () => {
      if (!attemptId) {
        skip();
      }

      const result = await resultApi.getResult(attemptId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('score');
      expect(result.data).toHaveProperty('percentage');
    });

    it('should get user results', async () => {
      const result = await resultApi.getUserResults();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get quiz statistics', async () => {
      if (!quizId) {
        const quizzes = await quizApi.getQuizzes();
        if (quizzes.data.length === 0) {
          skip();
        }
        quizId = quizzes.data[0].id;
      }

      const result = await resultApi.getQuizStats(quizId);

      expect(result.success).toBe(true);
    });
  });
});
