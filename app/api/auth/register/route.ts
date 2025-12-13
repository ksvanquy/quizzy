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

    if (!validateEmail(email)) {
      return sendError('Invalid email format', 400);
    }

    if (password.length < 6) {
      return sendError('Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return sendError('User already exists', 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError('Internal server error', 500);
  }
}
