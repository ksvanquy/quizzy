import { NextRequest } from 'next/server';
import { connectDatabase, getRepositories } from '@/infrastructure/persistence/database';
import { AuthService } from '@/core/auth/auth.service';
import { AuthMapper } from '@/core/auth/dto/auth.mapper';
import { loginSchema } from '@/core/shared/validation/schemas';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
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
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return sendValidationError('Invalid input', fieldErrors);
    }

    // Authenticate user (accepts either email or username per schema refine)
    const { email, username, password } = validation.data;

    if (!email && !username) {
      return sendValidationError('Invalid input', { email: ['Either email or username is required'] });
    }

    const result = email
      ? await authService.login(email, password)
      : await authService.loginByUsername(username as string, password);

    if (!result) {
      return sendUnauthorized('Invalid credentials');
    }

    const responseDto = AuthMapper.toAuthResponseDto(result.user, result.accessToken, result.refreshToken);

    logger.info('User login successful', { userId: result.user.id });

    return sendSuccess(responseDto, 'Login successful', HTTP_STATUS.OK);
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific error types
    if (error.code === 'UNAUTHORIZED') {
      return sendUnauthorized(error.message || 'Invalid credentials');
    }
    
    if (error.code === 'CONFLICT') {
      return sendError(error.message || 'Conflict', 409);
    }
    
    logger.error('Login error', { error: error.message });
    return sendError('Internal server error', 500);
  }
}
