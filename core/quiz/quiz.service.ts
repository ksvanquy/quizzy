import { Quiz, QuizEntity } from './quiz.entity';
import { IQuizRepository } from './quiz.repository';
import { NotFoundError, ConflictError } from '../shared/errors';
import { slugify } from '@/lib/utils/helpers';

/**
 * Quiz Service - Business logic for quiz management
 * Handles quiz creation, updates, status management, attempt validation
 */
export class QuizService {
  constructor(private repository: IQuizRepository) {}

  /**
   * Create a new quiz
   */
  async createQuiz(data: {
    title: string;
    description?: string;
    categoryId: string;
    createdById: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    totalPoints: number;
    passingScore: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    revealAnswersAfterSubmission?: boolean;
    tags?: string[];
  }): Promise<Quiz> {
    // Validate quiz parameters
    if (data.duration < 1 || data.duration > 300) {
      throw new Error('Duration must be between 1 and 300 minutes');
    }

    if (data.totalPoints < 1 || data.totalPoints > 1000) {
      throw new Error('Total points must be between 1 and 1000');
    }

    if (data.passingScore < 0 || data.passingScore > data.totalPoints) {
      throw new Error('Passing score must be between 0 and total points');
    }

    const slug = slugify(data.title);

    // Check if slug already exists
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Quiz with slug "${slug}" already exists`);
    }

    const quiz = await this.repository.create({
      ...data,
      slug,
      status: 'draft',
      maxAttempts: data.maxAttempts || 0,
      shuffleQuestions: data.shuffleQuestions ?? false,
      shuffleOptions: data.shuffleOptions ?? false,
      revealAnswersAfterSubmission: data.revealAnswersAfterSubmission ?? false,
      tags: data.tags || [],
      questionIds: [],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return quiz;
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: string): Promise<Quiz> {
    const quiz = await this.repository.findById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz', id);
    }
    return quiz;
  }

  /**
   * Get quiz by slug
   */
  async getQuizBySlug(slug: string): Promise<Quiz> {
    const quiz = await this.repository.findBySlug(slug);
    if (!quiz) {
      throw new NotFoundError('Quiz with slug', slug);
    }
    return quiz;
  }

  /**
   * Update quiz
   */
  async updateQuiz(
    id: string,
    data: {
      title?: string;
      description?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      duration?: number;
      totalPoints?: number;
      passingScore?: number;
      maxAttempts?: number;
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
      revealAnswersAfterSubmission?: boolean;
      tags?: string[];
    }
  ): Promise<Quiz> {
    const quiz = await this.getQuizById(id);

    // Validate updated parameters if provided
    if (data.duration && (data.duration < 1 || data.duration > 300)) {
      throw new Error('Duration must be between 1 and 300 minutes');
    }

    if (data.totalPoints && (data.totalPoints < 1 || data.totalPoints > 1000)) {
      throw new Error('Total points must be between 1 and 1000');
    }

    if (data.passingScore !== undefined) {
      const totalPoints = data.totalPoints || quiz.totalPoints;
      if (data.passingScore < 0 || data.passingScore > totalPoints) {
        throw new Error('Passing score must be between 0 and total points');
      }
    }

    // Check slug if title changes
    let slug = quiz.slug;
    if (data.title && data.title !== quiz.title) {
      slug = slugify(data.title);
      const existing = await this.repository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Quiz with slug "${slug}" already exists`);
      }
    }

    const updated = await this.repository.update(id, {
      ...data,
      slug,
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Add question to quiz
   */
  async addQuestion(quizId: string, questionId: string): Promise<Quiz> {
    const quiz = await this.getQuizById(quizId);

    if (quiz.questionIds.includes(questionId)) {
      throw new ConflictError('Question already added to quiz');
    }

    return this.repository.update(quizId, {
      questionIds: [...quiz.questionIds, questionId],
      updatedAt: new Date(),
    });
  }

  /**
   * Remove question from quiz
   */
  async removeQuestion(quizId: string, questionId: string): Promise<Quiz> {
    const quiz = await this.getQuizById(quizId);

    return this.repository.update(quizId, {
      questionIds: quiz.questionIds.filter((id) => id !== questionId),
      updatedAt: new Date(),
    });
  }

  /**
   * Reorder questions in quiz
   */
  async reorderQuestions(quizId: string, questionIds: string[]): Promise<Quiz> {
    const quiz = await this.getQuizById(quizId);

    // Validate all questions exist in quiz
    const quizQuestionSet = new Set(quiz.questionIds);
    const newQuestionSet = new Set(questionIds);

    if (quizQuestionSet.size !== newQuestionSet.size || 
        ![...quizQuestionSet].every(id => newQuestionSet.has(id))) {
      throw new Error('Invalid question order - missing or invalid questions');
    }

    return this.repository.update(quizId, {
      questionIds,
      updatedAt: new Date(),
    });
  }

  /**
   * Publish quiz (change status to active)
   */
  async publishQuiz(quizId: string): Promise<Quiz> {
    const quiz = await this.getQuizById(quizId);

    if (quiz.questionIds.length === 0) {
      throw new Error('Cannot publish quiz without questions');
    }

    return this.repository.update(quizId, {
      status: 'active',
      updatedAt: new Date(),
    });
  }

  /**
   * Archive quiz
   */
  async archiveQuiz(quizId: string): Promise<Quiz> {
    const quiz = await this.getQuizById(quizId);

    return this.repository.update(quizId, {
      status: 'archived',
      updatedAt: new Date(),
    });
  }

  /**
   * Check if user can attempt quiz
   */
  async canAttemptQuiz(quizId: string, userId: string, attemptCount: number): Promise<boolean> {
    const quiz = await this.getQuizById(quizId);

    // Must be active
    if (quiz.status !== 'active') {
      return false;
    }

    // Check max attempts
    if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
      return false;
    }

    return true;
  }

  /**
   * Get all quizzes by category
   */
  async getQuizzesByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Quiz[]; total: number }> {
    return this.repository.findByCategory(categoryId, page, limit);
  }

  /**
   * Get all quizzes created by user
   */
  async getQuizzesByCreator(createdById: string): Promise<Quiz[]> {
    return this.repository.findByCreator(createdById);
  }

  /**
   * Get all quizzes with pagination
   */
  async getAllQuizzes(
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Quiz[]; total: number }> {
    return this.repository.findAll(page, limit);
  }

  /**
   * Update quiz statistics
   */
  async updateStatistics(quizId: string, totalAttempts: number, averageScore: number): Promise<Quiz> {
    return this.repository.update(quizId, {
      totalAttempts,
      averageScore,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string): Promise<void> {
    await this.getQuizById(quizId);
    await this.repository.delete(quizId);
  }
}
