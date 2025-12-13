import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { QuizService } from '@/core/quiz/quiz.service';
import { QuizMapper } from '@/core/quiz/dto/quiz.mapper';
import { createQuizSchema, paginationSchema } from '@/core/shared/validation/schemas';
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
    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');

    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const fieldErrors = paginationValidation.error.flatten().fieldErrors;
      return sendValidationError('Invalid pagination params', fieldErrors);
    }

    let result;
    if (categoryId) {
      result = await quizService.getQuizzesByCategory(categoryId, page, limit);
    } else {
      result = await quizService.getAllQuizzes(page, limit);
    }

    const items = result.items.map((quiz) => QuizMapper.toResponseDto(quiz));

    return sendSuccess(
      { items, total: result.total, page, limit },
      undefined,
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Get quizzes error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch quizzes',
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

    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    const body = await request.json();

    const validation = createQuizSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    const quiz = await quizService.createQuiz({
      ...validation.data,
      createdById: payload.userId,
    });
    const responseDto = QuizMapper.toResponseDto(quiz);

    logger.info('Quiz created', { quizId: quiz.id, createdBy: payload.userId });

    return sendSuccess(responseDto, 'Quiz created', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate')) {
      return sendError('CONFLICT', error.message, HTTP_STATUS.CONFLICT);
    }

    logger.error('Create quiz error', error as Error);
    return sendError(
      'CREATE_ERROR',
      'Failed to create quiz',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
