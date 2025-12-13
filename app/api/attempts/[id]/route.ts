import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { AttemptService } from '@/core/attempt/attempt.service';
import { AttemptMapper } from '@/core/attempt/dto/attempt.mapper';
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
} from '@/lib/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';
import { validateToken } from '@/lib/guards/auth';

export async function GET(
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

    const { attemptRepository } = getRepositories();
    const attemptService = new AttemptService(attemptRepository);

    const attempt = await attemptService.getAttemptById(id);

    if (!attempt) {
      return sendNotFound('Attempt');
    }

    // Check if user owns this attempt
    if (attempt.userId !== payload.userId && payload.role !== 'admin') {
      return sendError('FORBIDDEN', 'You do not have access to this attempt', HTTP_STATUS.FORBIDDEN);
    }

    const responseDto = AttemptMapper.toResponseDto(attempt);
    return sendSuccess(responseDto);
  } catch (error) {
    logger.error('Get attempt error', error as Error);
    return sendError(
      'FETCH_ERROR',
      'Failed to fetch attempt',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
