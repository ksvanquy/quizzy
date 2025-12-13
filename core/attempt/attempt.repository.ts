import { Attempt } from './attempt.entity';

export interface IAttemptRepository {
  create(data: Partial<Attempt>): Promise<Attempt>;
  findById(id: string): Promise<Attempt | null>;
  update(id: string, data: Partial<Attempt>): Promise<Attempt>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ items: Attempt[]; total: number }>;
  findByQuizId(quizId: string, page: number, limit: number): Promise<{ items: Attempt[]; total: number }>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<Attempt[]>;
  countAttemptsByUserAndQuiz(userId: string, quizId: string): Promise<number>;
}
