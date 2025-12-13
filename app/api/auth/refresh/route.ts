import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { AuthService } from '@/core/auth/auth.service';
import { AuthMapper } from '@/core/auth/dto/auth.mapper';
import { refreshTokenSchema } from '@/core/shared/validation/schemas';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
} from '@/lib/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';
import { validateToken } from '@/lib/guards/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();
    const { userRepository } = getRepositories();
    const authService = new AuthService(userRepository);

    const body = await request.json();

    // Validate request
    const validation = refreshTokenSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    // Verify and refresh token
    const decoded = validateToken(validation.data.refreshToken);
    if (!decoded) {
      return sendUnauthorized('Invalid refresh token');
    }

    const result = await authService.refreshAccessToken(decoded.userId);

    const responseDto = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
    };

    logger.info('Token refreshed successfully', { userId: decoded.userId });

    return sendSuccess(responseDto, 'Token refreshed', HTTP_STATUS.OK);
  } catch (error) {
    logger.error('Refresh token error', error as Error);
    return sendError(
      'REFRESH_ERROR',
      'An error occurred during token refresh',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
