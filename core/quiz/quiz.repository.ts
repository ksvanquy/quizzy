import { Quiz } from './quiz.entity';

export interface IQuizRepository {
  create(data: Partial<Quiz>): Promise<Quiz>;
  findById(id: string): Promise<Quiz | null>;
  findBySlug(slug: string): Promise<Quiz | null>;
  update(id: string, data: Partial<Quiz>): Promise<Quiz>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ items: Quiz[]; total: number }>;
  findByCategory(categoryId: string, page: number, limit: number): Promise<{ items: Quiz[]; total: number }>;
  findByCreator(createdById: string): Promise<Quiz[]>;
}
