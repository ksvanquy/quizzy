import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { CategoryService } from '@/core/category/category.service';
import { CategoryMapper } from '@/core/category/dto/category.mapper';
import { updateCategorySchema } from '@/core/shared/validation/schemas';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendNotFound,
} from '@/lib/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';
import { validateToken } from '@/lib/guards/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string | undefined;
  try {
    const resolved = await params;
    slug = resolved.slug;
    await connectDatabase();
    const { categoryRepository } = getRepositories();
    const categoryService = new CategoryService(categoryRepository);

    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      return sendNotFound('Category');
    }

    const responseDto = CategoryMapper.toResponseDto(category);
    return sendSuccess(responseDto);
  } catch (error) {
    logger.error('Get category error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch category',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string | undefined;
  try {
    const resolved = await params;
    slug = resolved.slug;
    await connectDatabase();

    // Check authorization
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { categoryRepository } = getRepositories();
    const categoryService = new CategoryService(categoryRepository);

    const body = await request.json();

    // Validate request
    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    // Get category by slug
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) {
      return sendNotFound('Category');
    }

    // Update category
    const updated = await categoryService.updateCategory(category.id, validation.data);
    const responseDto = CategoryMapper.toResponseDto(updated);

    logger.info('Category updated', { categoryId: category.id });

    return sendSuccess(responseDto, 'Category updated');
  } catch (error) {
    logger.error('Update category error', error as Error);
    return sendError(
      'UPDATE_ERROR',
      'Failed to update category',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string | undefined;
  try {
    const resolved = await params;
    slug = resolved.slug;
    await connectDatabase();

    // Check authorization
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { categoryRepository } = getRepositories();
    const categoryService = new CategoryService(categoryRepository);

    // Get category by slug
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) {
      return sendNotFound('Category');
    }

    // Delete category
    await categoryService.deleteCategory(category.id);

    logger.info('Category deleted', { categoryId: category.id });

    return sendSuccess(null, 'Category deleted');
  } catch (error) {
    if (error instanceof Error && error.message.includes('children')) {
      return sendError('CONFLICT', error.message, HTTP_STATUS.CONFLICT);
    }

    logger.error('Delete category error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to delete category',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
