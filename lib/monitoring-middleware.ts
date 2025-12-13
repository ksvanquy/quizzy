import { NextRequest, NextResponse } from 'next/server';
import { MetricsCollector, metricsMiddleware } from '@/lib/metrics-collector';
import { StructuredLogger } from '@/lib/structured-logger';
import { logger } from '@/lib/logger/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Monitoring middleware for tracking all requests
 */
export async function monitoringMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = uuidv4();
  const startTime = Date.now();
  const method = request.method;
  const pathname = new URL(request.url).pathname;

  // Set request context
  StructuredLogger.setRequestContext(requestId, {
    requestId,
  });

  // Log request
  StructuredLogger.logRequest(method, pathname, requestId);

  try {
    // Call the handler
    const response = await handler(request);

    // Record metrics
    const duration = Date.now() - startTime;
    const statusCode = response.status;

    metricsMiddleware(method, pathname, statusCode, duration);
    StructuredLogger.logResponse(requestId, statusCode, duration);

    // Add metrics headers
    const headers = new Headers(response.headers);
    headers.set('X-Request-ID', requestId);
    headers.set('X-Response-Time', `${duration}ms`);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Request error', {
      requestId,
      method,
      pathname,
      duration,
      error,
    });

    MetricsCollector.recordError(error as Error);
    MetricsCollector.recordResponseTime(duration);

    return NextResponse.json(
      {
        error: 'Internal server error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * Middleware wrapper to add monitoring to route handlers
 */
export function withMonitoring<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (request: NextRequest) => {
    return monitoringMiddleware(request, handler as any);
  }) as T;
}
