import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { BookmarkService } from '@/core/bookmark/bookmark.service';
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

    const { bookmarkRepository } = getRepositories();
    const bookmarkService = new BookmarkService(bookmarkRepository);

    await bookmarkService.removeBookmark(payload.userId, quizId);

    logger.info('Bookmark removed', { userId: payload.userId, quizId });

    return sendSuccess(null, 'Bookmark removed', HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return sendNotFound('Bookmark');
    }
    logger.error('Remove bookmark error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to remove bookmark',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
