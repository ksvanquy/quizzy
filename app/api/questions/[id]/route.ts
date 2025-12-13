import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { QuestionService } from '@/core/question/question.service';
import { QuestionMapper } from '@/core/question/dto/question.mapper';
import { updateQuestionSchema } from '@/core/shared/validation/schemas';
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
    const { questionRepository } = getRepositories();
    const questionService = new QuestionService(questionRepository);

    const question = await questionService.getQuestionById(params.id);

    if (!question) {
      return sendNotFound('Question');
    }

    const responseDto = QuestionMapper.toResponseDto(question);
    return sendSuccess(responseDto);
  } catch (error) {
    logger.error('Get question error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch question',
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

    const { questionRepository } = getRepositories();
    const questionService = new QuestionService(questionRepository);

    const question = await questionService.getQuestionById(params.id);
    if (!question) {
      return sendNotFound('Question');
    }

    const body = await request.json();

    const validation = updateQuestionSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    const updated = await questionService.updateQuestion(params.id, validation.data);
    const responseDto = QuestionMapper.toResponseDto(updated);

    logger.info('Question updated', { questionId: params.id });

    return sendSuccess(responseDto, 'Question updated');
  } catch (error) {
    logger.error('Update question error', error as Error);
    return sendError(
      'UPDATE_ERROR',
      'Failed to update question',
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

    const { questionRepository } = getRepositories();
    const questionService = new QuestionService(questionRepository);

    const question = await questionService.getQuestionById(params.id);
    if (!question) {
      return sendNotFound('Question');
    }

    await questionService.deleteQuestion(params.id);

    logger.info('Question deleted', { questionId: params.id });

    return sendSuccess(null, 'Question deleted');
  } catch (error) {
    logger.error('Delete question error', error as Error);
    return sendError(
      'DELETE_ERROR',
      'Failed to delete question',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
