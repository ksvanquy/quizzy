import { Category, CategoryEntity } from './category.entity';
import { ICategoryRepository } from './category.repository';
import { NotFoundError, ConflictError } from '../shared/errors';
import { slugify } from '@/lib/utils/helpers';

/**
 * Category Service - Business logic for category management
 * Handles hierarchical category structure, CRUD operations
 */
export class CategoryService {
  constructor(private repository: ICategoryRepository) {}

  /**
   * Create a new category
   */
  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    parentId?: string | null;
    displayOrder?: number;
  }): Promise<Category> {
    // Check if parent category exists (if provided)
    if (data.parentId) {
      const parent = await this.repository.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category', data.parentId);
      }
    }

    // Create slug from name
    const slug = slugify(data.name);

    // Check if slug already exists
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Category with slug "${slug}" already exists`);
    }

    const category = await this.repository.create({
      ...data,
      slug,
      displayOrder: data.displayOrder || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return category;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundError('Category', id);
    }
    return category;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.repository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError('Category with slug', slug);
    }
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<Category> {
    const category = await this.getCategoryById(id);

    // If name is updated, update slug
    let slug = category.slug;
    if (data.name) {
      slug = slugify(data.name);

      // Check if new slug conflicts with another category
      if (slug !== category.slug) {
        const existing = await this.repository.findBySlug(slug);
        if (existing) {
          throw new ConflictError(`Category with slug "${slug}" already exists`);
        }
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
   * Get all subcategories of a parent
   */
  async getSubcategories(parentId: string | null = null): Promise<Category[]> {
    return this.repository.findByParentId(parentId);
  }

  /**
   * Get all root categories
   */
  async getRootCategories(): Promise<Category[]> {
    return this.repository.findByParentId(null);
  }

  /**
   * Get all categories with pagination
   */
  async getAllCategories(
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Category[]; total: number }> {
    return this.repository.findAll(page, limit);
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy(parentId?: string | null): Promise<Array<Category & { children?: Category[] }>> {
    const categories = await this.getSubcategories(parentId ?? null);

    // Recursively get children
    const withChildren = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        children: await this.getCategoryHierarchy(cat.id),
      }))
    );

    return withChildren;
  }

  /**
   * Move category to different parent
   */
  async moveCategory(categoryId: string, newParentId: string | null): Promise<Category> {
    const category = await this.getCategoryById(categoryId);

    // Check for circular reference
    if (newParentId && newParentId !== category.parentId) {
      let parentId: string | null = newParentId;
      const visited = new Set<string>();

      while (parentId) {
        if (visited.has(parentId)) {
          throw new Error('Circular reference detected');
        }
        visited.add(parentId);

        const parent = await this.repository.findById(parentId);
        if (!parent) break;
        parentId = parent.parentId ?? null;

        if (parentId === categoryId) {
          throw new Error('Cannot move category to its own child');
        }
      }
    }

    // Check if new parent exists
    if (newParentId) {
      const parent = await this.repository.findById(newParentId);
      if (!parent) {
        throw new NotFoundError('Parent category', newParentId);
      }
    }

    return this.repository.update(categoryId, {
      parentId: newParentId,
      updatedAt: new Date(),
    });
  }

  /**
   * Deactivate category
   */
  async deactivateCategory(id: string): Promise<void> {
    await this.getCategoryById(id);
    await this.repository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Activate category
   */
  async activateCategory(id: string): Promise<void> {
    await this.getCategoryById(id);
    await this.repository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);

    // Check if category has subcategories
    const children = await this.getSubcategories(id);
    if (children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    await this.repository.delete(id);
  }
}
