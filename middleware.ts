import { NextRequest, NextResponse } from 'next/server';
import { getLogger } from './lib/logger/logger';
import { verifyAccessToken } from './lib/utils/jwt';
import { UnauthorizedError } from './core/shared/errors';

const logger = getLogger('middleware');

/**
 * App Router Middleware
 * Runs on all requests matching the matcher config
 * Handles authentication and request logging
 */
export async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: request.method,
    pathname,
  });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/auth/login',
    '/auth/register',
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check authentication for protected routes
  if (!isPublicRoute && pathname.startsWith('/api')) {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      logger.warn('Missing auth token', { requestId, pathname });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing authentication token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    try {
      const payload = verifyAccessToken(token);
      // Attach user to headers for route handler access
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-request-id', requestId);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Log response time
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        requestId,
        pathname,
        duration,
        status: response.status,
      });

      return response;
    } catch (error) {
      logger.error('Token verification failed', {
        requestId,
        pathname,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();
  const duration = Date.now() - startTime;

  // Log request duration
  if (duration > 5000) {
    logger.warn('Slow request detected', {
      requestId,
      pathname,
      duration,
    });
  }

  return response;
}

/**
 * Matcher configuration
 * Specifies which routes should go through middleware
 */
export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Protected pages
    '/(pages)/quiz/:path*',
    '/(pages)/result/:path*',
    '/(pages)/history/:path*',
    '/(pages)/bookmarks/:path*',
    '/(pages)/watchlist/:path*',
    '/(pages)/profile/:path*',
  ],
};
