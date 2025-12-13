import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { QuestionService } from '@/core/question/question.service';
import { QuestionMapper } from '@/core/question/dto/question.mapper';
import { createQuestionSchema, paginationSchema } from '@/core/shared/validation/schemas';
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
    const { questionRepository } = getRepositories();
    const questionService = new QuestionService(questionRepository);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const fieldErrors = paginationValidation.error.flatten().fieldErrors;
      return sendValidationError('Invalid pagination params', fieldErrors);
    }

    const result = await questionService.getAllQuestions(page, limit);
    const items = result.items.map((q) => QuestionMapper.toResponseDto(q));

    return sendSuccess(
      { items, total: result.total, page, limit },
      undefined,
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Get questions error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch questions',
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

    const { questionRepository } = getRepositories();
    const questionService = new QuestionService(questionRepository);

    const body = await request.json();

    // Note: createQuestionSchema is a union type for all question types
    const validation = createQuestionSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      return sendValidationError('Invalid input', fieldErrors);
    }

    const question = await questionService.createQuestion(validation.data as any);
    const responseDto = QuestionMapper.toResponseDto(question);

    logger.info('Question created', { questionId: question.id, type: validation.data.type });

    return sendSuccess(responseDto, 'Question created', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create question error', error as Error);
    return sendError(
      'CREATE_ERROR',
      'Failed to create question',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
