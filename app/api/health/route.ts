import { NextRequest, NextResponse } from 'next/server';
import { handleHealthCheck, HealthChecker, createDatabaseHealthCheck, createApiHealthCheck } from '@/lib/health-checker';
import { logger } from '@/lib/logger/logger';

// Initialize health checks on startup
HealthChecker.registerCheck('database', createDatabaseHealthCheck());
HealthChecker.registerCheck('api', createApiHealthCheck());

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    return await handleHealthCheck();
  } catch (error) {
    logger.error('Health check failed', error as Error);
    return NextResponse.json(
      { status: 'unhealthy', error: 'Internal server error' },
      { status: 503 }
    );
  }
}

/**
 * Readiness check - for Kubernetes
 */
export async function HEAD(request: NextRequest) {
  try {
    const result = await HealthChecker.runHealthChecks();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    return new NextResponse(null, { status: statusCode });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
