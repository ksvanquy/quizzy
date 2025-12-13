import { Attempt, AttemptEntity, Answer } from './attempt.entity';
import { IAttemptRepository } from './attempt.repository';
import { NotFoundError } from '../shared/errors';
import { SCORING } from '@/constants/app.constants';

/**
 * Attempt Service - Business logic for quiz attempts and scoring
 * Handles attempt creation, answer submission, scoring, and result calculation
 */
export class AttemptService {
  constructor(private repository: IAttemptRepository) {}

  /**
   * Start a new quiz attempt
   */
  async startAttempt(userId: string, quizId: string): Promise<Attempt> {
    const now = new Date();

    const attempt = await this.repository.create({
      userId,
      quizId,
      answers: [],
      totalScore: 0,
      passed: false,
      timeSpent: 0,
      startedAt: now,
      submittedAt: null as any, // Will be set on submission
      createdAt: now,
      updatedAt: now,
    });

    return attempt;
  }

  /**
   * Get attempt by ID
   */
  async getAttemptById(id: string): Promise<Attempt> {
    const attempt = await this.repository.findById(id);
    if (!attempt) {
      throw new NotFoundError('Attempt', id);
    }
    return attempt;
  }

  /**
   * Get all attempts by user
   */
  async getAttemptsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Attempt[]; total: number }> {
    return this.repository.findByUserId(userId, page, limit);
  }

  /**
   * Get all attempts for a quiz
   */
  async getAttemptsByQuiz(
    quizId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Attempt[]; total: number }> {
    return this.repository.findByQuizId(quizId, page, limit);
  }

  /**
   * Get all attempts by user for specific quiz
   */
  async getAttemptsByUserAndQuiz(userId: string, quizId: string): Promise<Attempt[]> {
    return this.repository.findByUserAndQuiz(userId, quizId);
  }

  /**
   * Count attempts by user for specific quiz
   */
  async countAttemptsByUserAndQuiz(userId: string, quizId: string): Promise<number> {
    return this.repository.countAttemptsByUserAndQuiz(userId, quizId);
  }

  /**
   * Add answer to attempt
   */
  async addAnswer(
    attemptId: string,
    questionId: string,
    userAnswer: any,
    isCorrect: boolean,
    pointsEarned: number
  ): Promise<Attempt> {
    const attempt = await this.getAttemptById(attemptId);

    // Check if answer already exists
    const existingIndex = attempt.answers.findIndex((a) => a.questionId === questionId);
    const answer: Answer = {
      questionId,
      userAnswer,
      isCorrect,
      pointsEarned,
    };

    let updatedAnswers = attempt.answers;
    if (existingIndex >= 0) {
      // Update existing answer
      updatedAnswers[existingIndex] = answer;
    } else {
      // Add new answer
      updatedAnswers = [...attempt.answers, answer];
    }

    return this.repository.update(attemptId, {
      answers: updatedAnswers,
      updatedAt: new Date(),
    });
  }

  /**
   * Submit attempt and calculate score
   */
  async submitAttempt(attemptId: string, totalPoints: number, passingScore: number): Promise<Attempt> {
    const attempt = await this.getAttemptById(attemptId);

    if (attempt.submittedAt) {
      throw new Error('Attempt already submitted');
    }

    // Calculate total score from answers
    const totalScore = attempt.answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);

    // Determine if passed
    const passed = totalScore >= passingScore;

    // Calculate time spent in seconds
    const timeSpent = Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000);

    const submitted = await this.repository.update(attemptId, {
      totalScore,
      passed,
      timeSpent,
      submittedAt: new Date(),
      updatedAt: new Date(),
    });

    return submitted;
  }

  /**
   * Get score as percentage
   */
  getScorePercentage(attempt: Attempt, totalPoints: number): number {
    if (totalPoints === 0) return 0;
    return (attempt.totalScore / totalPoints) * 100;
  }

  /**
   * Get score grade (A, B, C, D, F)
   */
  getScoreGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Get attempt duration in seconds
   */
  getAttemptDuration(attempt: Attempt): number {
    if (!attempt.submittedAt) {
      return Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000);
    }
    return attempt.timeSpent;
  }

  /**
   * Get attempt duration formatted
   */
  getFormattedDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Get correct answers count
   */
  getCorrectAnswersCount(attempt: Attempt): number {
    return attempt.answers.filter((a) => a.isCorrect).length;
  }

  /**
   * Get wrong answers count
   */
  getWrongAnswersCount(attempt: Attempt): number {
    return attempt.answers.filter((a) => !a.isCorrect).length;
  }

  /**
   * Get accuracy percentage
   */
  getAccuracyPercentage(attempt: Attempt): number {
    if (attempt.answers.length === 0) return 0;
    const correct = this.getCorrectAnswersCount(attempt);
    return (correct / attempt.answers.length) * 100;
  }

  /**
   * Get best attempt by user for quiz
   */
  async getBestAttempt(userId: string, quizId: string): Promise<Attempt | null> {
    const attempts = await this.getAttemptsByUserAndQuiz(userId, quizId);
    if (attempts.length === 0) return null;

    return attempts.reduce((best, current) =>
      current.totalScore > best.totalScore ? current : best
    );
  }

  /**
   * Get latest attempt by user for quiz
   */
  async getLatestAttempt(userId: string, quizId: string): Promise<Attempt | null> {
    const attempts = await this.getAttemptsByUserAndQuiz(userId, quizId);
    if (attempts.length === 0) return null;

    return attempts.reduce((latest, current) =>
      current.startedAt > latest.startedAt ? current : latest
    );
  }

  /**
   * Calculate average score for quiz
   */
  async getAverageScore(quizId: string): Promise<number> {
    const result = await this.repository.findByQuizId(quizId, 1, 10000);
    if (result.items.length === 0) return 0;

    const totalScore = result.items.reduce((sum, attempt) => sum + attempt.totalScore, 0);
    return totalScore / result.items.length;
  }

  /**
   * Delete attempt
   */
  async deleteAttempt(id: string): Promise<void> {
    await this.getAttemptById(id);
    await this.repository.delete(id);
  }
}
