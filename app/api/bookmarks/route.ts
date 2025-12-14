import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { BookmarkService } from '@/core/bookmark/bookmark.service';
import { BookmarkMapper } from '@/core/bookmark/dto/bookmark.mapper';
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

    const { bookmarkRepository } = getRepositories();
    const bookmarkService = new BookmarkService(bookmarkRepository);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const fieldErrors = paginationValidation.error.flatten().fieldErrors;
      return sendValidationError('Invalid pagination params', fieldErrors);
    }

    const result = await bookmarkService.getBookmarksByUser(payload.userId, page, limit);
    // Fetch quiz details for ids/slugs
    const quizIds = Array.from(new Set(result.items.map((b) => b.quizId)));
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
        const key = quizIds[idx];
        quizMap.set(key, QuizMapper.toResponseDto(quiz));
      }
    });

    const items = result.items.map((bookmark) => {
      const quiz = quizMap.get(bookmark.quizId);
      const normalizedQuiz = quiz ? { _id: quiz.id, ...quiz } : bookmark.quizId;
      return {
        _id: (bookmark as any)._id ?? bookmark.id,
        userId: bookmark.userId,
        quizId: normalizedQuiz,
        createdAt: (bookmark as any).createdAt,
      };
    });

    return sendSuccess(
      { items, total: result.total, page, limit },
      undefined,
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Get bookmarks error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch bookmarks',
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

    const { bookmarkRepository } = getRepositories();
    const bookmarkService = new BookmarkService(bookmarkRepository);

    const body = await request.json();
    const { quizId } = body;

    if (!quizId) {
      return sendError('VALIDATION_ERROR', 'quizId is required', HTTP_STATUS.BAD_REQUEST);
    }

    const bookmark = await bookmarkService.bookmarkQuiz(payload.userId, quizId);
    const responseDto = BookmarkMapper.toResponseDto(bookmark);

    logger.info('Quiz bookmarked', { userId: payload.userId, quizId });

    return sendSuccess(responseDto, 'Quiz bookmarked', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already bookmarked')) {
      return sendError('CONFLICT', error.message, HTTP_STATUS.CONFLICT);
    }

    logger.error('Create bookmark error', error as Error);
    return sendError(
      'CREATE_ERROR',
      'Failed to bookmark quiz',
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

    const { bookmarkRepository } = getRepositories();
    const bookmarkService = new BookmarkService(bookmarkRepository);

    // Get quizId from URL path or query params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const quizId = pathParts[pathParts.length - 1] || url.searchParams.get('quizId');

    if (!quizId || quizId === 'bookmarks') {
      return sendError('VALIDATION_ERROR', 'quizId is required', HTTP_STATUS.BAD_REQUEST);
    }

    await bookmarkService.removeBookmark(payload.userId, quizId);

    logger.info('Bookmark removed', { userId: payload.userId, quizId });

    return sendSuccess(null, 'Bookmark removed', HTTP_STATUS.OK);
  } catch (error) {
    logger.error('Remove bookmark error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to remove bookmark',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}