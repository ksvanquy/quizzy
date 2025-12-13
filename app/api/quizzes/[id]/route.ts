import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { QuizService } from '@/core/quiz/quiz.service';
import { QuizMapper } from '@/core/quiz/dto/quiz.mapper';
import { updateQuizSchema } from '@/core/shared/validation/schemas';
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
import { NotFoundError } from '@/core/shared/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const resolved = await params;
    id = resolved.id;
    await connectDatabase();
    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    const quiz = await quizService.getQuizById(id);

    if (!quiz) {
      return sendNotFound('Quiz');
    }

    const responseDto = QuizMapper.toResponseDto(quiz);
    return sendSuccess(responseDto);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return sendNotFound('Quiz');
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Get quiz error', { id, error: errorMsg, stack: error instanceof Error ? error.stack : '' });
    console.error('[GET /api/quizzes/[id]]', { id, error: errorMsg });
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch quiz',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const resolved = await params;
    id = resolved.id;
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    // Check if quiz exists
    const quiz = await quizService.getQuizById(id);
    if (!quiz) {
      return sendNotFound('Quiz');
    }

    const body = await request.json();

    const validation = updateQuizSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    const updated = await quizService.updateQuiz(id, validation.data);
    const responseDto = QuizMapper.toResponseDto(updated);

    logger.info('Quiz updated', { quizId: id });

    return sendSuccess(responseDto, 'Quiz updated');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return sendNotFound('Quiz');
    }
    logger.error('Update quiz error', error as Error);
    return sendError(
      'UPDATE_ERROR',
      'Failed to update quiz',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const resolved = await params;
    id = resolved.id;
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    const quiz = await quizService.getQuizById(id);
    if (!quiz) {
      return sendNotFound('Quiz');
    }

    await quizService.deleteQuiz(id);

    logger.info('Quiz deleted', { quizId: id });

    return sendSuccess(null, 'Quiz deleted');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return sendNotFound('Quiz');
    }
    logger.error('Delete quiz error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to delete quiz',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
