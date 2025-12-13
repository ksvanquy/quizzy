import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/lib/performance-monitor';
import { MetricsCollector, MetricsSnapshot } from '@/lib/metrics-collector';
import { ErrorTracker } from '@/lib/error-tracker';
import { logger } from '@/lib/logger/logger';

/**
 * Monitoring dashboard data
 */
export interface MonitoringData {
  timestamp: string;
  performance: Record<string, any>;
  metrics: MetricsSnapshot;
  recentErrors: Array<{ id: string; message: string; count: number }>;
  summary: {
    healthStatus: 'good' | 'warning' | 'critical';
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    memoryUsageMB: number;
  };
}

/**
 * Monitoring utilities for dashboard
 */
export class MonitoringDashboard {
  /**
   * Get current monitoring data
   */
  static getMonitoringData(): MonitoringData {
    const metrics = MetricsCollector.getSnapshot();
    const performance = PerformanceMonitor.getAllStats();
    const errors = ErrorTracker.getAllReports();

    // Group errors by message
    const errorCounts: Map<string, number> = new Map();
    for (const error of errors) {
      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    }

    const recentErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({
        id: message,
        message,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate health status
    const errorRate =
      metrics.totalRequests > 0
        ? (metrics.totalErrors / metrics.totalRequests) * 100
        : 0;
    let healthStatus: 'good' | 'warning' | 'critical' = 'good';
    if (errorRate > 5) {
      healthStatus = 'critical';
    } else if (errorRate > 2) {
      healthStatus = 'warning';
    }

    const memoryUsageMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024);

    return {
      timestamp: new Date().toISOString(),
      performance,
      metrics,
      recentErrors,
      summary: {
        healthStatus,
        totalRequests: metrics.totalRequests,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(metrics.avgResponseTime),
        memoryUsageMB,
      },
    };
  }

  /**
   * Get performance report
   */
  static getPerformanceReport() {
    const stats = PerformanceMonitor.getAllStats();
    const report: Record<string, any> = {};

    for (const [name, stat] of Object.entries(stats)) {
      report[name] = {
        ...stat,
        avgDuration: Math.round(stat.avgDuration),
        minDuration: Math.round(stat.minDuration),
        maxDuration: Math.round(stat.maxDuration),
        successRate: Math.round(stat.successRate * 100) / 100,
      };
    }

    return report;
  }

  /**
   * Get metrics report
   */
  static getMetricsReport() {
    const snapshot = MetricsCollector.getSnapshot();
    return {
      timestamp: snapshot.timestamp,
      uptime: `${Math.floor(snapshot.uptime / 1000)}s`,
      requests: snapshot.totalRequests,
      errors: snapshot.totalErrors,
      avgResponseTime: `${Math.round(snapshot.avgResponseTime)}ms`,
      memory: {
        heapUsed: `${Math.round(snapshot.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(snapshot.memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(snapshot.memoryUsage.external / 1024 / 1024)}MB`,
      },
      customMetrics: snapshot.customMetrics,
    };
  }

  /**
   * Get error report
   */
  static getErrorReport() {
    const errors = ErrorTracker.getAllReports();
    const groupedByLevel: Record<string, number> = {};

    for (const error of errors) {
      const level = error.level || 'error';
      groupedByLevel[level] = (groupedByLevel[level] || 0) + 1;
    }

    return {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      byLevel: groupedByLevel,
      recentErrors: errors.slice(-20),
    };
  }

  /**
   * Export data for external dashboard
   */
  static exportForDashboard() {
    return {
      timestamp: new Date().toISOString(),
      monitoring: this.getMonitoringData(),
      performance: this.getPerformanceReport(),
      metrics: this.getMetricsReport(),
      errors: this.getErrorReport(),
    };
  }
}

/**
 * Monitoring endpoint handler
 */
export async function handleMonitoringRequest(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const path = request.nextUrl.pathname;

    if (path.includes('/metrics')) {
      return NextResponse.json(MonitoringDashboard.getMetricsReport());
    }

    if (path.includes('/performance')) {
      return NextResponse.json(MonitoringDashboard.getPerformanceReport());
    }

    if (path.includes('/errors')) {
      return NextResponse.json(MonitoringDashboard.getErrorReport());
    }

    // Default: return full monitoring data
    return NextResponse.json(MonitoringDashboard.getMonitoringData());
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
