import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { WatchlistService } from '@/core/watchlist/watchlist.service';
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
} from '@/lib/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';
import { validateToken } from '@/lib/guards/auth';
import { NotFoundError } from '@/core/shared/errors';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  let quizId: string | undefined;
  try {
    const resolved = await params;
    quizId = resolved.quizId;
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { watchlistRepository } = getRepositories();
    const watchlistService = new WatchlistService(watchlistRepository);

    await watchlistService.removeFromWatchlist(payload.userId, quizId);

    logger.info('Watchlist item removed', { userId: payload.userId, quizId });

    return sendSuccess(null, 'Removed from watchlist', HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return sendNotFound('Watchlist item');
    }
    logger.error('Remove from watchlist error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to remove from watchlist',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
