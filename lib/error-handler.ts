import { NextRequest, NextResponse } from 'next/server';
import { DomainError } from '@/core/shared/errors/domain-error';
import { logger } from '@/lib/logger/logger';
import { HTTP_STATUS } from '@/constants/http-status';
import { sendError } from '@/lib/api-response';

/**
 * Global error handler for API routes
 * Catches all errors and returns standardized error response
 */
export class GlobalErrorHandler {
  static handle(error: unknown): NextResponse {
    // Log error
    logger.error('API Error', error instanceof Error ? error : new Error(String(error)));

    // Handle domain errors
    if (error instanceof DomainError) {
      return sendError(
        error.code,
        error.message,
        error.statusCode,
        error.details
      );
    }

    // Handle validation errors (Zod)
    if (error instanceof Error && error.message.includes('ZodError')) {
      return sendError(
        'VALIDATION_ERROR',
        'Invalid request data',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Handle MongoDB/Mongoose errors
    if (error instanceof Error && error.name === 'MongoError') {
      return sendError(
        'DATABASE_ERROR',
        'Database error occurred',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return sendError(
        'VALIDATION_ERROR',
        error.message,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Handle duplicate key error (E11000)
    if (error instanceof Error && error.message.includes('E11000')) {
      return sendError(
        'CONFLICT',
        'Duplicate entry detected',
        HTTP_STATUS.CONFLICT
      );
    }

    // Handle JWT errors
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return sendError(
        'INVALID_TOKEN',
        'Invalid or expired token',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return sendError(
        'TOKEN_EXPIRED',
        'Token has expired',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return sendError(
        'TIMEOUT',
        'Request timeout',
        HTTP_STATUS.REQUEST_TIMEOUT
      );
    }

    // Generic error handler
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return sendError(
      'INTERNAL_ERROR',
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Wrapper to catch errors in async route handlers
 */
export function catchErrors(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return GlobalErrorHandler.handle(error);
    }
  };
}
