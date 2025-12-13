import { Model } from 'mongoose';
import { ICategoryRepository } from '@/core/category/category.repository';
import { Category } from '@/core/category/category.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';
import { ConflictError } from '@/core/shared/errors/conflict-error';

export class CategoryRepository implements ICategoryRepository {
  constructor(private categoryModel: Model<any>) {}

  async create(data: Partial<Category>): Promise<Category> {
    // Check if slug already exists
    const existingCategory = await this.categoryModel.findOne({ slug: data.slug });
    if (existingCategory) {
      throw new ConflictError('Category slug already exists');
    }

    // Validate parent category exists if parentId is provided
    if (data.parentId) {
      const parentCategory = await this.categoryModel.findById(data.parentId);
      if (!parentCategory) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const category = new this.categoryModel(data);
    await category.save();
    return this.mapToEntity(category);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.categoryModel.findById(id).lean();
    return category ? this.mapToEntity(category) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.categoryModel.findOne({ slug }).lean();
    return category ? this.mapToEntity(category) : null;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    // Check if slug is being updated and if it already exists
    if (data.slug) {
      const existingCategory = await this.categoryModel.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existingCategory) {
        throw new ConflictError('Category slug already exists');
      }
    }

    // Validate parent category exists if parentId is being updated
    if (data.parentId) {
      // Prevent circular reference: parent cannot be the category itself or its children
      if (data.parentId === id) {
        throw new ConflictError('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryModel.findById(data.parentId);
      if (!parentCategory) {
        throw new NotFoundError('Parent category not found');
      }

      // Check for circular reference
      const isCircular = await this.hasCircularReference(id, data.parentId);
      if (isCircular) {
        throw new ConflictError('Circular reference detected in category hierarchy');
      }
    }

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: data, updatedAt: new Date() },
      { new: true }
    );

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return this.mapToEntity(category);
  }

  async delete(id: string): Promise<void> {
    // Check if category has children
    const childrenCount = await this.categoryModel.countDocuments({ parentId: id });
    if (childrenCount > 0) {
      throw new ConflictError('Cannot delete category with children');
    }

    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Category not found');
    }
  }

  async findAll(page: number, limit: number): Promise<{ items: Category[]; total: number }> {
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      this.categoryModel.find().skip(skip).limit(limit).lean(),
      this.categoryModel.countDocuments(),
    ]);

    return {
      items: categories.map((category) => this.mapToEntity(category)),
      total,
    };
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    const categories = await this.categoryModel.find({ parentId }).lean();
    return categories.map((category) => this.mapToEntity(category));
  }

  private async hasCircularReference(categoryId: string, parentId: string): Promise<boolean> {
    let currentId = parentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        return true; // Circular reference detected
      }

      if (currentId === categoryId) {
        return true; // Would create circular reference
      }

      visited.add(currentId);
      const category = await this.categoryModel.findById(currentId).lean();
      currentId = category?.parentId;
    }

    return false;
  }

  private mapToEntity(doc: any): Category {
    return {
      id: doc._id?.toString() || doc.id,
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      icon: doc.icon,
      parentId: doc.parentId,
      displayOrder: doc.displayOrder,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
