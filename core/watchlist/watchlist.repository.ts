import { Watchlist } from './watchlist.entity';

export interface IWatchlistRepository {
  create(data: Partial<Watchlist>): Promise<Watchlist>;
  findById(id: string): Promise<Watchlist | null>;
  delete(id: string): Promise<void>;
  findByUser(userId: string, page: number, limit: number): Promise<{ items: Watchlist[]; total: number }>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<Watchlist | null>;
  deleteByUserAndQuiz(userId: string, quizId: string): Promise<void>;
}
