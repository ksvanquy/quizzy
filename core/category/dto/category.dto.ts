/**
 * Category DTOs - Data Transfer Objects for category operations
 */

// Create Category DTO
export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  displayOrder?: number;
}

// Update Category DTO
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Move Category DTO
export interface MoveCategoryDto {
  newParentId: string | null;
}

// Category Response DTO
export interface CategoryResponseDto {
  _id: string;
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

// Category with Children DTO
export interface CategoryWithChildrenDto extends CategoryResponseDto {
  children?: CategoryWithChildrenDto[];
}
