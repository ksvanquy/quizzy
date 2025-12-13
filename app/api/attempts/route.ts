import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { AttemptService } from '@/core/attempt/attempt.service';
import { AttemptMapper } from '@/core/attempt/dto/attempt.mapper';
import { paginationSchema } from '@/core/shared/validation/schemas';
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

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { attemptRepository } = getRepositories();
    const attemptService = new AttemptService(attemptRepository);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const fieldErrors = paginationValidation.error.flatten().fieldErrors;
      return sendValidationError('Invalid pagination params', fieldErrors);
    }

    const result = await attemptService.getUserAttempts(payload.userId, page, limit);
    const items = result.items.map((attempt) => AttemptMapper.toResponseDto(attempt));

    return sendSuccess(
      { items, total: result.total, page, limit },
      undefined,
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Get attempts error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch attempts',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
