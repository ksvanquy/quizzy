import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { WatchlistService } from '@/core/watchlist/watchlist.service';
import { WatchlistMapper } from '@/core/watchlist/dto/watchlist.mapper';
import { QuizMapper } from '@/core/quiz/dto/quiz.mapper';
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
    const quizIds = Array.from(new Set(result.items.map((w) => w.quizId)));
    const { quizRepository } = getRepositories();

    const quizzes = await Promise.all(
      quizIds.map(async (qid) => {
        if (!qid) return null;
        if (Types.ObjectId.isValid(qid)) {
          const byId = await quizRepository.findById(qid);
          if (byId) return byId;
        }
        return await quizRepository.findBySlug(qid);
      })
    );

    const quizMap = new Map<string, any>();
    quizzes.forEach((quiz, idx) => {
      if (quiz) {
        quizMap.set(quizIds[idx], QuizMapper.toResponseDto(quiz));
      }
    });

    const items = result.items.map((watchlist) => {
      const quiz = quizMap.get(watchlist.quizId);
      const normalizedQuiz = quiz ? { _id: quiz.id, ...quiz } : watchlist.quizId;
      return {
        _id: (watchlist as any)._id ?? watchlist.id,
        userId: watchlist.userId,
        quizId: normalizedQuiz,
        createdAt: (watchlist as any).createdAt,
      };
    });

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

export async function DELETE(request: NextRequest) {
  try {
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { watchlistRepository } = getRepositories();
    const watchlistService = new WatchlistService(watchlistRepository);

    // Get quizId from URL path or query params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const quizId = pathParts[pathParts.length - 1] || url.searchParams.get('quizId');

    if (!quizId || quizId === 'watchlist') {
      return sendError('VALIDATION_ERROR', 'quizId is required', HTTP_STATUS.BAD_REQUEST);
    }

    await watchlistService.removeFromWatchlist(payload.userId, quizId);

    logger.info('Removed from watchlist', { userId: payload.userId, quizId });

    return sendSuccess(null, 'Removed from watchlist', HTTP_STATUS.OK);
  } catch (error) {
    logger.error('Remove from watchlist error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to remove from watchlist',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}