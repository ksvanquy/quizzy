import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { CategoryService } from '@/core/category/category.service';
import { CategoryMapper } from '@/core/category/dto/category.mapper';
import { createCategorySchema, paginationSchema } from '@/core/shared/validation/schemas';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
} from '@/lib/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';
import { validateToken } from '@/lib/guards/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();
    const { categoryRepository } = getRepositories();
    const categoryService = new CategoryService(categoryRepository);

    // Get pagination params from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination
    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const fieldErrors = paginationValidation.error.flatten().fieldErrors;
      return sendValidationError('Invalid pagination params', fieldErrors);
    }

    const result = await categoryService.getAllCategories(page, limit);
    const items = result.items.map((cat) => CategoryMapper.toResponseDto(cat));

    return sendSuccess(
      { items, total: result.total, page, limit },
      undefined,
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Get categories error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch categories',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    const category = await categoryService.createCategory(validation.data);
    const responseDto = CategoryMapper.toResponseDto(category);

    logger.info('Category created', { categoryId: category.id });

    return sendSuccess(responseDto, 'Category created', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate')) {
      return sendError('CONFLICT', error.message, HTTP_STATUS.CONFLICT);
    }

    logger.error('Create category error', error as Error);
    return sendError(
      'CREATE_ERROR',
      'Failed to create category',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
