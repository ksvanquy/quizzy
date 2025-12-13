import { Category } from './category.entity';

export interface ICategoryRepository {
  create(data: Partial<Category>): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  update(id: string, data: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ items: Category[]; total: number }>;
  findByParentId(parentId: string | null): Promise<Category[]>;
}
