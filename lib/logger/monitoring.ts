/**
 * Monitoring Service
 * Performance monitoring and metrics collection
 */

import { getLogger } from './logger';

const logger = getLogger('Monitoring');

export interface PerformanceMetric {
  name: string;
  duration: number; // ms
  timestamp: string;
  path?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
  requestId?: string;
}

export interface MetricsData {
  httpRequests: PerformanceMetric[];
  databaseQueries: PerformanceMetric[];
  functionExecutions: PerformanceMetric[];
}

/**
 * Performance Monitor
 * Tracks and logs performance metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: MetricsData = {
    httpRequests: [],
    databaseQueries: [],
    functionExecutions: [],
  };
  private maxMetricsSize = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record HTTP request metric
   */
  recordHttpRequest(metric: PerformanceMetric): void {
    this.metrics.httpRequests.push(metric);
    this.pruneMetrics();

    // Warn if request takes too long
    if (metric.duration > 5000) {
      logger.warn(`Slow HTTP request: ${metric.method} ${metric.path} took ${metric.duration}ms`, {
        method: metric.method,
        path: metric.path,
        duration: metric.duration,
      });
    }
  }

  /**
   * Record database query metric
   */
  recordDatabaseQuery(metric: PerformanceMetric): void {
    this.metrics.databaseQueries.push(metric);
    this.pruneMetrics();

    // Warn if query takes too long
    if (metric.duration > 1000) {
      logger.warn(`Slow database query: ${metric.name} took ${metric.duration}ms`, {
        name: metric.name,
        duration: metric.duration,
      });
    }
  }

  /**
   * Record function execution metric
   */
  recordFunctionExecution(metric: PerformanceMetric): void {
    this.metrics.functionExecutions.push(metric);
    this.pruneMetrics();
  }

  /**
   * Get average response time for HTTP requests
   */
  getAverageHttpRequestTime(): number {
    if (this.metrics.httpRequests.length === 0) return 0;
    const total = this.metrics.httpRequests.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.httpRequests.length;
  }

  /**
   * Get slowest HTTP requests
   */
  getSlowestHttpRequests(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics.httpRequests]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get average database query time
   */
  getAverageDatabaseQueryTime(): number {
    if (this.metrics.databaseQueries.length === 0) return 0;
    const total = this.metrics.databaseQueries.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.databaseQueries.length;
  }

  /**
   * Get slowest database queries
   */
  getSlowestDatabaseQueries(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics.databaseQueries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    return {
      httpRequests: {
        total: this.metrics.httpRequests.length,
        average: this.getAverageHttpRequestTime(),
        slowest: this.getSlowestHttpRequests(5),
      },
      databaseQueries: {
        total: this.metrics.databaseQueries.length,
        average: this.getAverageDatabaseQueryTime(),
        slowest: this.getSlowestDatabaseQueries(5),
      },
      functionExecutions: {
        total: this.metrics.functionExecutions.length,
      },
    };
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = {
      httpRequests: [],
      databaseQueries: [],
      functionExecutions: [],
    };
  }

  /**
   * Prune old metrics if size exceeds limit
   */
  private pruneMetrics(): void {
    const totalMetrics =
      this.metrics.httpRequests.length +
      this.metrics.databaseQueries.length +
      this.metrics.functionExecutions.length;

    if (totalMetrics > this.maxMetricsSize) {
      // Remove oldest 20%
      const removeCount = Math.floor(this.maxMetricsSize * 0.2);
      this.metrics.httpRequests = this.metrics.httpRequests.slice(removeCount);
      this.metrics.databaseQueries = this.metrics.databaseQueries.slice(removeCount);
      this.metrics.functionExecutions = this.metrics.functionExecutions.slice(removeCount);
    }
  }
}

/**
 * Get global performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Decorator to measure function execution time
 */
export function measureExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      performanceMonitor.recordFunctionExecution({
        name: `${target.constructor.name}.${propertyKey}`,
        duration,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Error in ${propertyKey}: ${error}`, error as Error);
      throw error;
    }
  };

  return descriptor;
}
