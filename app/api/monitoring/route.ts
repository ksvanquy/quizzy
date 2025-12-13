import { NextRequest, NextResponse } from 'next/server';
import { handleMonitoringRequest } from '@/lib/monitoring-dashboard';
import { logger } from '@/lib/logger/logger';

/**
 * Monitoring endpoint
 * GET /api/monitoring
 * GET /api/monitoring/metrics
 * GET /api/monitoring/performance
 * GET /api/monitoring/errors
 */
export async function GET(request: NextRequest) {
  try {
    return await handleMonitoringRequest(request);
  } catch (error) {
    logger.error('Monitoring request failed', error as Error);
    return NextResponse.json(
      {
        error: 'Failed to get monitoring data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
