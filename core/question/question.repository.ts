import { Question } from './question.entity';

export interface IQuestionRepository {
  create(data: Partial<Question>): Promise<Question>;
  findById(id: string): Promise<Question | null>;
  update(id: string, data: Partial<Question>): Promise<Question>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ items: Question[]; total: number }>;
  findByQuizId(quizId: string): Promise<Question[]>;
  findByCategory(categoryId: string): Promise<Question[]>;
  findByType(type: string): Promise<Question[]>;
}
