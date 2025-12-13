import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '../utils/jwt';
import { getLogger } from '../logger/logger';
import { TokenPayload } from '../../types/domain.types';

const logger = getLogger('auth-guard');

/**
 * Extract token from request headers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Extract user info from request headers (set by middleware)
 */
export function getUserFromRequest(request: NextRequest): {
  userId: string;
  role: string;
  requestId: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const requestId = request.headers.get('x-request-id');

  if (!userId || !role || !requestId) {
    return null;
  }

  return { userId, role, requestId };
}

/**
 * Validate token from request
 */
export function validateTokenFromRequest(request: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(request);

  if (!token) {
    logger.warn('Missing token in request');
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    return payload;
  } catch (error) {
    logger.warn('Invalid token', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Guard handler - wrap API route handler with authentication
 * Usage: export async function GET(request) { return withAuth(request, handler); }
 */
export async function withAuth<T>(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const user = getUserFromRequest(request);

  if (!user) {
    const payload = validateTokenFromRequest(request);

    if (!payload) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized access',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      ) as NextResponse<T>;
    }

    // Create user object from token payload
    const authenticatedUser = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };

    return handler(request, authenticatedUser);
  }

  return handler(request, user);
}

/**
 * Guard handler - wrap API route handler with role-based access
 * Usage: export async function DELETE(request) { return withRole(request, handler, 'admin'); }
 */
export async function withRole<T>(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse<T>>,
  allowedRoles: string | string[]
): Promise<NextResponse<T>> {
  return withAuth(request, async (req, user) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(user.role)) {
      logger.warn('Forbidden access attempt', {
        userId: user.userId,
        userRole: user.role,
        allowedRoles: roles,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      ) as NextResponse<T>;
    }

    return handler(req, user);
  });
}

/**
 * Verify token - throw error if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  return verifyAccessToken(token);
}

// Backward compatibility aliases
export const validateToken = verifyAccessToken;

/**
 * Is user admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}

/**
 * Is user teacher
 */
export function isTeacher(user: any): boolean {
  return user?.role === 'teacher';
}

/**
 * Is user student
 */
export function isStudent(user: any): boolean {
  return user?.role === 'student';
}
