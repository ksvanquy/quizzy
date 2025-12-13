import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger/logger';

export interface LogContext {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  error?: string;
}

/**
 * Middleware for logging HTTP requests and responses
 */
export async function loggingMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;

  try {
    const response = await handler(request);
    const duration = Date.now() - startTime;

    const context: LogContext = {
      method,
      path,
      statusCode: response.status,
      duration,
    };

    // Log based on status code
    if (response.status >= 500) {
      logger.error(`${method} ${path}`, context);
    } else if (response.status >= 400) {
      logger.warn(`${method} ${path}`, context);
    } else {
      logger.info(`${method} ${path}`, context);
    }

    // Add performance header
    const newResponse = new NextResponse(response.body, response);
    newResponse.headers.set('X-Response-Time', `${duration}ms`);

    return newResponse;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${method} ${path} - Exception`, {
      method,
      path,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Request logger for debugging
 */
export class RequestLogger {
  static logRequest(request: NextRequest, additionalInfo?: Record<string, any>) {
    const info = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers),
      ...additionalInfo,
    };
    logger.debug('Request received', info);
  }

  static logResponse(statusCode: number, duration: number, data?: any) {
    logger.debug('Response sent', {
      statusCode,
      duration,
      dataSize: JSON.stringify(data).length,
    });
  }
}
