import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger/logger';

/**
 * Health check for monitoring services
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthStatus;
    api: HealthStatus;
    cache?: HealthStatus;
    memory?: HealthStatus;
  };
  version: string;
  uptime: number;
}

export interface HealthStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck?: string;
  message?: string;
}

/**
 * Health checker
 */
export class HealthChecker {
  private static checks: Map<string, () => Promise<HealthStatus>> = new Map();
  private static lastResults: Map<string, HealthStatus> = new Map();
  private static startTime: number = Date.now();

  /**
   * Register a health check
   */
  static registerCheck(name: string, check: () => Promise<HealthStatus>) {
    this.checks.set(name, check);
  }

  /**
   * Run all health checks
   */
  static async runHealthChecks(): Promise<HealthCheckResult> {
    const results: Record<string, HealthStatus> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, check] of this.checks) {
      try {
        const startTime = Date.now();
        const status = await Promise.race([
          check(),
          new Promise<HealthStatus>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]);

        status.responseTime = Date.now() - startTime;
        status.lastCheck = new Date().toISOString();

        results[name] = status;
        this.lastResults.set(name, status);

        if (status.status === 'down') {
          overallStatus = 'unhealthy';
        } else if (status.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        const failedStatus: HealthStatus = {
          status: 'down',
          lastCheck: new Date().toISOString(),
          message: error instanceof Error ? error.message : 'Unknown error',
        };

        results[name] = failedStatus;
        this.lastResults.set(name, failedStatus);
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results as any,
      version: '1.0.0',
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Get last check result
   */
  static getLastResult(name: string): HealthStatus | undefined {
    return this.lastResults.get(name);
  }

  /**
   * Reset checks
   */
  static reset() {
    this.checks.clear();
    this.lastResults.clear();
  }
}

/**
 * Health check endpoint handler
 */
export async function handleHealthCheck(): Promise<NextResponse> {
  try {
    const result = await HealthChecker.runHealthChecks();

    const statusCode =
      result.status === 'healthy'
        ? 200
        : result.status === 'degraded'
          ? 200
          : 503;

    logger.info('Health check', {
      status: result.status,
      uptime: `${Math.floor(result.uptime / 1000)}s`,
    });

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed', error as Error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

/**
 * Create database health check
 */
export function createDatabaseHealthCheck(): () => Promise<HealthStatus> {
  return async () => {
    try {
      const start = Date.now();

      // Try to connect to database
      // This would depend on your database implementation
      // For now, just a simple check
      const duration = Date.now() - start;

      if (duration > 3000) {
        return {
          status: 'degraded',
          message: 'Database response time is slow',
        };
      }

      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}

/**
 * Create API health check
 */
export function createApiHealthCheck(): () => Promise<HealthStatus> {
  return async () => {
    try {
      // Simple check - if we're running, API is up
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}
