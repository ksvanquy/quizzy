import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { AuthService } from '@/core/auth/auth.service';
import { AuthMapper } from '@/core/auth/dto/auth.mapper';
import { registerSchema } from '@/core/shared/validation/schemas';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendConflict,
} from '@/lib/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();
    const { userRepository } = getRepositories();
    const authService = new AuthService(userRepository);

    const body = await request.json();

    // Validate request
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    // Register user
    const result = await authService.register({
      username: validation.data.username,
      email: validation.data.email,
      password: validation.data.password,
      name: validation.data.name,
    });

    const responseDto = AuthMapper.toAuthResponseDto(result.user, result.accessToken, result.refreshToken);

    logger.info('User registered successfully', { userId: result.user.id });

    return sendSuccess(responseDto, 'Registration successful', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already')) {
        return sendConflict(error.message);
      }
    }

    logger.error('Register error', error as Error);
    return sendError(
      'REGISTER_ERROR',
      'An error occurred during registration',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
