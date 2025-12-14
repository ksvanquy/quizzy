import { NextRequest, NextResponse } from 'next/server';
import { getLogger } from './lib/logger/logger';
import { verifyAccessToken, debugVerifyToken } from './lib/utils/jwt';
import { UnauthorizedError } from './core/shared/errors';

// Use Node.js runtime to have access to environment variables
export const runtime = 'nodejs';

const logger = getLogger('middleware');

// Check env on first run
let envChecked = false;
if (!envChecked) {
  // console.log('[Middleware Init] Environment check:', {
  //   jwtSecretSet: !!process.env.JWT_SECRET,
  //   jwtSecretLength: process.env.JWT_SECRET?.length || 0,
  //   jwtSecretPrefix: process.env.JWT_SECRET?.substring(0, 10) || 'N/A',
  //   nodeEnv: process.env.NODE_ENV,
  //   timestamp: new Date().toISOString(),
  // });
  envChecked = true;
}

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
    '/api/auth/refresh',
    '/api/categories',
    '/api/quizzes',
    '/auth/login',
    '/auth/register',
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check authentication for protected routes
  if (!isPublicRoute && pathname.startsWith('/api')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      logger.warn('Missing auth token', { 
        requestId, 
        pathname,
        authHeader: authHeader ? '[present but malformed]' : '[missing]',
      });
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

    // console.log('[Middleware] Token verification start:', {
    //   requestId,
    //   pathname,
    //   tokenLength: token.length,
    //   tokenPrefix: token.substring(0, 30),
    //   jwtSecretEnv: !!process.env.JWT_SECRET,
    // });

    // Use debug function to get detailed info
    const debugResult = debugVerifyToken(token);
    const payload = debugResult.valid ? debugResult.payload : null;
    
    if (!payload) {
      // console.error('[Middleware] Token verification failed:', {
      //   requestId,
      //   pathname,
      //   reason: debugResult.error || 'Token is invalid or expired',
      //   tokenLength: token.length,
      // });
      
      logger.warn('Token verification failed', {
        requestId,
        pathname,
        reason: debugResult.error || 'Token is invalid or expired',
        tokenLength: token.length,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: debugResult.error || 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    try {
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
      logger.error('Request processing failed', {
        requestId,
        pathname,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
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
