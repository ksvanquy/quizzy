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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();
    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    const quiz = await quizService.getQuizById(params.id);

    if (!quiz) {
      return sendNotFound('Quiz');
    }

    const responseDto = QuizMapper.toResponseDto(quiz);
    return sendSuccess(responseDto);
  } catch (error) {
    logger.error('Get quiz error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch quiz',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    // Check if quiz exists
    const quiz = await quizService.getQuizById(params.id);
    if (!quiz) {
      return sendNotFound('Quiz');
    }

    const body = await request.json();

    const validation = updateQuizSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    const updated = await quizService.updateQuiz(params.id, validation.data);
    const responseDto = QuizMapper.toResponseDto(updated);

    logger.info('Quiz updated', { quizId: params.id });

    return sendSuccess(responseDto, 'Quiz updated');
  } catch (error) {
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = validateToken(token || '');
    if (!payload) {
      return sendUnauthorized('Authorization required');
    }

    const { quizRepository } = getRepositories();
    const quizService = new QuizService(quizRepository);

    const quiz = await quizService.getQuizById(params.id);
    if (!quiz) {
      return sendNotFound('Quiz');
    }

    await quizService.deleteQuiz(params.id);

    logger.info('Quiz deleted', { quizId: params.id });

    return sendSuccess(null, 'Quiz deleted');
  } catch (error) {
    logger.error('Delete quiz error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to delete quiz',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
