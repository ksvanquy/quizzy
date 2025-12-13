import { Bookmark } from './bookmark.entity';
import { IBookmarkRepository } from './bookmark.repository';
import { NotFoundError, ConflictError } from '../shared/errors';

/**
 * Bookmark Service - Business logic for quiz bookmarks
 * Handles user bookmarking/unbookmarking quizzes
 */
export class BookmarkService {
  constructor(private repository: IBookmarkRepository) {}

  /**
   * Bookmark a quiz
   */
  async bookmarkQuiz(userId: string, quizId: string): Promise<Bookmark> {
    // Check if already bookmarked
    const existing = await this.repository.findByUserAndQuiz(userId, quizId);
    if (existing) {
      throw new ConflictError('Quiz already bookmarked by user');
    }

    const bookmark = await this.repository.create({
      userId,
      quizId,
      createdAt: new Date(),
    });

    return bookmark;
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, quizId: string): Promise<void> {
    const bookmark = await this.repository.findByUserAndQuiz(userId, quizId);
    if (!bookmark) {
      throw new NotFoundError('Bookmark');
    }

    await this.repository.deleteByUserAndQuiz(userId, quizId);
  }

  /**
   * Check if quiz is bookmarked by user
   */
  async isBookmarked(userId: string, quizId: string): Promise<boolean> {
    const bookmark = await this.repository.findByUserAndQuiz(userId, quizId);
    return !!bookmark;
  }

  /**
   * Get all bookmarks by user
   */
  async getBookmarksByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Bookmark[]; total: number }> {
    return this.repository.findByUser(userId, page, limit);
  }

  /**
   * Get bookmark by ID
   */
  async getBookmarkById(id: string): Promise<Bookmark> {
    const bookmark = await this.repository.findById(id);
    if (!bookmark) {
      throw new NotFoundError('Bookmark', id);
    }
    return bookmark;
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(id: string): Promise<void> {
    await this.getBookmarkById(id);
    await this.repository.delete(id);
  }
}
