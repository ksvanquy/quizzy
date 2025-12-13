/**
 * Example: Monitoring Integration with Route Handlers
 * This file demonstrates how to use monitoring utilities in your API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { withMonitoring } from '@/lib/monitoring-middleware';
import { StructuredLogger } from '@/lib/structured-logger';
import { ErrorTracker } from '@/lib/error-tracker';
import { PerformanceMonitor } from '@/lib/performance-monitor';
import { logger } from '@/lib/logger/logger';
import { APIResponse } from '@/lib/api-response';

/**
 * Example 1: Basic Route with Monitoring
 * Usage: GET /api/example/basic
 */
export const basicRouteExample = withMonitoring(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id') || '';

  try {
    // Your route logic
    const data = { message: 'Hello' };

    return APIResponse.success(data);
  } catch (error) {
    ErrorTracker.reportError(error as Error, {
      userId: 'user123',
      request: {
        method: request.method,
        url: request.url,
      },
    });

    return APIResponse.error('Failed to process request');
  }
});

/**
 * Example 2: Route with Performance Tracking
 * Usage: GET /api/example/performance
 */
export const performanceTrackingExample = withMonitoring(async (request: NextRequest) => {
  const { startTime, mark } = PerformanceMonitor.start();

  try {
    // Track database query
    const dbStartTime = Date.now();
    // const users = await db.user.find();
    const duration = Date.now() - dbStartTime;

    PerformanceMonitor.record('database_query', startTime, 'success', {
      operation: 'find_users',
      duration: `${duration}ms`,
    });

    mark('route_completion', 'success');

    return APIResponse.success({ count: 10 });
  } catch (error) {
    mark('route_completion', 'error');
    return APIResponse.error('Database query failed');
  }
});

/**
 * Example 3: Route with Structured Logging
 * Usage: POST /api/example/user
 */
export const structuredLoggingExample = withMonitoring(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id') || '';

  try {
    const body = await request.json();

    // Log user action
    StructuredLogger.logEvent('user.registration_attempted', {
      email: body.email,
      source: 'web',
    });

    // Simulate user creation
    const user = {
      id: '123',
      email: body.email,
      createdAt: new Date().toISOString(),
    };

    // Log success
    StructuredLogger.logEvent('user.created', {
      userId: user.id,
      email: user.email,
    });

    // Log audit trail
    StructuredLogger.logAudit(
      'CREATE',
      body.email,
      `user:${user.id}`,
      'success',
      { ipAddress: request.headers.get('x-forwarded-for') }
    );

    return APIResponse.success(user, 201);
  } catch (error) {
    StructuredLogger.logErrorWithContext(
      error as Error,
      'User registration failed',
      { email: (error as any).email }
    );

    return APIResponse.error('Registration failed');
  }
});

/**
 * Example 4: Route with Error Tracking
 * Usage: DELETE /api/example/user/[id]
 */
export const errorTrackingExample = withMonitoring(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id') || '';
  const userId = '123';

  try {
    // Your deletion logic
    // await db.user.delete(userId);

    StructuredLogger.logAudit(
      'DELETE',
      requestId,
      `user:${userId}`,
      'success'
    );

    return APIResponse.success({ message: 'User deleted' });
  } catch (error) {
    const report = ErrorTracker.reportError(error as Error, {
      userId,
      message: 'User deletion failed',
      request: {
        method: 'DELETE',
        url: request.url,
      },
      tags: {
        severity: 'high',
        resource: 'user',
      },
    });

    logger.error('Error tracking example', {
      errorId: report.id,
      userId,
    });

    return APIResponse.error('Deletion failed', 500);
  }
});

/**
 * Example 5: Route with Custom Metrics
 * Usage: GET /api/example/quiz
 */
export const metricsExample = withMonitoring(async (request: NextRequest) => {
  const { MetricsCollector } = await import('@/lib/metrics-collector');

  try {
    // Your quiz fetching logic
    const quizzes = [];

    // Record custom metrics
    MetricsCollector.increment('quiz.viewed');
    MetricsCollector.gauge('quiz.count', 42);

    // Track by type if needed
    MetricsCollector.increment('quiz.type.multiple_choice', 1, { category: 'math' });

    return APIResponse.success({ quizzes, total: 42 });
  } catch (error) {
    MetricsCollector.recordError(error as Error, { route: '/api/example/quiz' });
    return APIResponse.error('Failed to fetch quizzes');
  }
});

/**
 * Example 6: Using Decorator Pattern (TypeScript)
 * This demonstrates using the @Monitored decorator for class methods
 */
import { Monitored } from '@/lib/performance-monitor';

class UserService {
  @Monitored('user.service.create')
  async create(userData: any) {
    // Your creation logic
    return { id: '123', ...userData };
  }

  @Monitored('user.service.findById')
  async findById(id: string) {
    // Your find logic
    return { id, name: 'John' };
  }

  @Monitored('user.service.update')
  async update(id: string, userData: any) {
    // Your update logic
    return { id, ...userData };
  }
}

/**
 * Example 7: Complete Route Handler with All Features
 * Usage: POST /api/example/complete
 */
export const completeExample = withMonitoring(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id') || '';
  const userId = request.headers.get('x-user-id') || 'anonymous';
  const { PerformanceMonitor } = await import('@/lib/performance-monitor');
  const { MetricsCollector } = await import('@/lib/metrics-collector');

  const { startTime, mark } = PerformanceMonitor.start();

  try {
    // Parse request
    const body = await request.json();

    // Log request details
    StructuredLogger.logRequest(request.method, request.url, requestId, userId);

    // Track operation
    StructuredLogger.logEvent('operation.started', {
      operation: 'complete_example',
      input: { keys: Object.keys(body) },
    });

    // Simulate work with performance tracking
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Record metrics
    MetricsCollector.increment('operation.completed');
    MetricsCollector.gauge('active_operations', 5);

    // Audit trail
    StructuredLogger.logAudit(
      'PROCESS',
      userId,
      'operation',
      'success',
      { itemCount: Object.keys(body).length }
    );

    // Performance logging
    const duration = Date.now() - startTime;
    StructuredLogger.logPerformance('complete_example', duration, 'success');

    mark('operation', 'success');

    return APIResponse.success({
      message: 'Operation completed',
      requestId,
      duration: `${duration}ms`,
    });
  } catch (error) {
    mark('operation', 'error');

    // Error tracking
    const report = ErrorTracker.reportError(error as Error, {
      userId,
      message: 'Complete example failed',
    });

    // Error logging
    StructuredLogger.logErrorWithContext(
      error as Error,
      'Complete example error',
      { requestId, userId }
    );

    // Performance logging for errors
    const duration = Date.now() - startTime;
    StructuredLogger.logPerformance('complete_example', duration, 'error');

    return APIResponse.error('Operation failed', 500);
  }
});

export default {
  basicRouteExample,
  performanceTrackingExample,
  structuredLoggingExample,
  errorTrackingExample,
  metricsExample,
  completeExample,
};
