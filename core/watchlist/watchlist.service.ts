import { Watchlist } from './watchlist.entity';
import { IWatchlistRepository } from './watchlist.repository';
import { NotFoundError, ConflictError } from '../shared/errors';

/**
 * Watchlist Service - Business logic for quiz watchlist
 * Handles user adding/removing quizzes to/from watchlist
 */
export class WatchlistService {
  constructor(private repository: IWatchlistRepository) {}

  /**
   * Add quiz to watchlist
   */
  async addToWatchlist(userId: string, quizId: string): Promise<Watchlist> {
    // Check if already in watchlist
    const existing = await this.repository.findByUserAndQuiz(userId, quizId);
    if (existing) {
      throw new ConflictError('Quiz already in user watchlist');
    }

    const watchlist = await this.repository.create({
      userId,
      quizId,
      createdAt: new Date(),
    });

    return watchlist;
  }

  /**
   * Remove quiz from watchlist
   */
  async removeFromWatchlist(userId: string, quizId: string): Promise<void> {
    const watchlist = await this.repository.findByUserAndQuiz(userId, quizId);
    if (!watchlist) {
      throw new NotFoundError('Watchlist entry');
    }

    await this.repository.deleteByUserAndQuiz(userId, quizId);
  }

  /**
   * Check if quiz is in user's watchlist
   */
  async isInWatchlist(userId: string, quizId: string): Promise<boolean> {
    const watchlist = await this.repository.findByUserAndQuiz(userId, quizId);
    return !!watchlist;
  }

  /**
   * Get all watchlist entries by user
   */
  async getWatchlistByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Watchlist[]; total: number }> {
    return this.repository.findByUser(userId, page, limit);
  }

  /**
   * Get watchlist entry by ID
   */
  async getWatchlistById(id: string): Promise<Watchlist> {
    const watchlist = await this.repository.findById(id);
    if (!watchlist) {
      throw new NotFoundError('Watchlist entry', id);
    }
    return watchlist;
  }

  /**
   * Delete watchlist entry
   */
  async deleteWatchlistEntry(id: string): Promise<void> {
    await this.getWatchlistById(id);
    await this.repository.delete(id);
  }

  /**
   * Count watchlist entries for user
   */
  async countWatchlistForUser(userId: string): Promise<number> {
    const result = await this.repository.findByUser(userId, 1, 1000000);
    return result.total;
  }
}
