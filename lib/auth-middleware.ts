import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getUserFromToken } from '@/lib/guards/auth';
import { sendUnauthorized } from '@/lib/api-response';

export interface AuthPayload {
  userId: string;
  email?: string;
  role?: string;
}

/**
 * Authentication middleware for protecting routes
 * Validates JWT token and extracts user information
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, auth: AuthPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Extract token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return sendUnauthorized('Authorization token required');
    }

    // Validate token
    const payload = validateToken(token);

    if (!payload) {
      return sendUnauthorized('Invalid or expired token');
    }

    // Extract user info from token
    const auth: AuthPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    // Call handler with auth context
    return await handler(request, auth);
  } catch (error) {
    return sendUnauthorized('Authentication failed');
  }
}

/**
 * Role-based authorization middleware
 */
export async function withRole(
  request: NextRequest,
  requiredRole: string | string[],
  handler: (req: NextRequest, auth: AuthPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, auth) => {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!auth.role || !roles.includes(auth.role)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(req, auth);
  });
}

/**
 * Optional authentication middleware
 * Allows request to proceed but adds auth context if token is provided
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: NextRequest, auth?: AuthPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      const payload = validateToken(token);
      if (payload) {
        return handler(request, {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        });
      }
    }

    return handler(request);
  } catch (error) {
    // Continue without auth on error
    return handler(request);
  }
}
