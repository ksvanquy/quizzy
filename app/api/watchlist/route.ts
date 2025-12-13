import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { WatchlistService } from '@/core/watchlist/watchlist.service';
import { WatchlistMapper } from '@/core/watchlist/dto/watchlist.mapper';
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

    const { watchlistRepository } = getRepositories();
    const watchlistService = new WatchlistService(watchlistRepository);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const fieldErrors = paginationValidation.error.flatten().fieldErrors;
      return sendValidationError('Invalid pagination params', fieldErrors);
    }

    const result = await watchlistService.getWatchlistByUser(payload.userId, page, limit);
    const items = result.items.map((watchlist) => WatchlistMapper.toResponseDto(watchlist));

    return sendSuccess(
      { items, total: result.total, page, limit },
      undefined,
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Get watchlist error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch watchlist',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { watchlistRepository } = getRepositories();
    const watchlistService = new WatchlistService(watchlistRepository);

    const body = await request.json();
    const { quizId } = body;

    if (!quizId) {
      return sendError('VALIDATION_ERROR', 'quizId is required', HTTP_STATUS.BAD_REQUEST);
    }

    const watchlist = await watchlistService.addToWatchlist(payload.userId, quizId);
    const responseDto = WatchlistMapper.toResponseDto(watchlist);

    logger.info('Quiz added to watchlist', { userId: payload.userId, quizId });

    return sendSuccess(responseDto, 'Quiz added to watchlist', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already')) {
      return sendError('CONFLICT', error.message, HTTP_STATUS.CONFLICT);
    }

    logger.error('Add to watchlist error', error as Error);
    return sendError(
      'CREATE_ERROR',
      'Failed to add to watchlist',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
