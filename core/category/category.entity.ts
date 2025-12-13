/**
 * Category Entity - Domain model for quiz categories
 * Supports hierarchical organization with parent categories
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryEntity implements Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Category) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.icon = data.icon;
    this.parentId = data.parentId;
    this.displayOrder = data.displayOrder;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isRootCategory(): boolean {
    return !this.parentId;
  }
}
