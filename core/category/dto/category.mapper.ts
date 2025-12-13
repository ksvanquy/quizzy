import { Category } from '../category.entity';
import { CategoryResponseDto, CategoryWithChildrenDto } from './category.dto';

/**
 * Category Mapper - Convert between Category entity and DTOs
 */
export class CategoryMapper {
  /**
   * Convert Category entity to CategoryResponseDto
   */
  static toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Convert Category entity with children to CategoryWithChildrenDto
   */
  static toResponseWithChildrenDto(
    category: Category & { children?: Category[] }
  ): CategoryWithChildrenDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      children: category.children?.map((child) =>
        this.toResponseWithChildrenDto(child as any)
      ),
    };
  }

  /**
   * Convert array of Category entities to ResponseDtos
   */
  static toResponseDtos(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => this.toResponseDto(category));
  }
}
