import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/constants/http-status';
import { logger } from '@/lib/logger/logger';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Send success response
 */
export function sendSuccess<T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Send error response
 */
export function sendError(
  codeOrMessage: string,
  messageOrStatus?: string | number,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
): NextResponse<ApiErrorResponse> {
  // Allow legacy signature sendError(message, statusCode)
  const isLegacy = typeof messageOrStatus === 'number';
  const code = isLegacy ? 'ERROR' : codeOrMessage;
  const message = isLegacy ? codeOrMessage : (messageOrStatus as string);
  const finalStatus = isLegacy ? (messageOrStatus as number) : statusCode;

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  logger.error(`API Error: [${code}] ${message}`, details);

  return NextResponse.json(response, { status: finalStatus });
}

/**
 * Send validation error response
 */
export function sendValidationError(
  message: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return sendError(
    'VALIDATION_ERROR',
    message,
    HTTP_STATUS.BAD_REQUEST,
    details
  );
}

/**
 * Send unauthorized error response
 */
export function sendUnauthorized(message: string = 'Unauthorized access'): NextResponse<ApiErrorResponse> {
  return sendError('UNAUTHORIZED', message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Send forbidden error response
 */
export function sendForbidden(message: string = 'Access forbidden'): NextResponse<ApiErrorResponse> {
  return sendError('FORBIDDEN', message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Send not found error response
 */
export function sendNotFound(resource: string = 'Resource'): NextResponse<ApiErrorResponse> {
  return sendError('NOT_FOUND', `${resource} not found`, HTTP_STATUS.NOT_FOUND);
}

/**
 * Send conflict error response
 */
export function sendConflict(message: string): NextResponse<ApiErrorResponse> {
  return sendError('CONFLICT', message, HTTP_STATUS.CONFLICT);
}
