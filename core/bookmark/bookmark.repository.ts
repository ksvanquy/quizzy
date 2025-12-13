import { Bookmark } from './bookmark.entity';

export interface IBookmarkRepository {
  create(data: Partial<Bookmark>): Promise<Bookmark>;
  findById(id: string): Promise<Bookmark | null>;
  delete(id: string): Promise<void>;
  findByUser(userId: string, page: number, limit: number): Promise<{ items: Bookmark[]; total: number }>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<Bookmark | null>;
  deleteByUserAndQuiz(userId: string, quizId: string): Promise<void>;
}
