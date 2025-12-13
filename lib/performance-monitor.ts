import { logger } from '@/lib/logger/logger';

/**
 * Performance monitoring and metrics collection
 */
export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  status: 'success' | 'error';
  context?: Record<string, any>;
}

export interface PerformanceStats {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  lastUpdated: string;
}

/**
 * Performance monitor for tracking operation times
 */
export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric[]> = new Map();

  /**
   * Start monitoring an operation
   */
  static start(): { startTime: number; mark: (name: string, status?: string) => void } {
    const startTime = Date.now();

    return {
      startTime,
      mark: (name: string, status: 'success' | 'error' = 'success') => {
        PerformanceMonitor.record(name, startTime, status);
      },
    };
  }

  /**
   * Record a metric
   */
  static record(
    name: string,
    startTime: number,
    status: 'success' | 'error' = 'success',
    context?: Record<string, any>
  ) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric: PerformanceMetric = {
      name,
      duration,
      startTime,
      endTime,
      status,
      context,
    };

    this.metrics.get(name)!.push(metric);

    // Keep only last 1000 metrics per operation
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Log slow operations
    if (duration > 5000) {
      logger.warn(`Slow operation detected: ${name}`, {
        duration: `${duration}ms`,
        context,
      });
    }
  }

  /**
   * Get stats for a metric
   */
  static getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const successCount = metrics.filter((m) => m.status === 'success').length;

    return {
      count: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / metrics.length) * 100,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all stats
   */
  static getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {};

    for (const [name] of this.metrics) {
      const stat = this.getStats(name);
      if (stat) {
        stats[name] = stat;
      }
    }

    return stats;
  }

  /**
   * Reset metrics
   */
  static reset(name?: string) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

/**
 * Wrapper to automatically track performance
 */
export async function trackPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const { startTime, mark } = PerformanceMonitor.start();

  try {
    const result = await fn();
    mark(name, 'success');
    return result;
  } catch (error) {
    mark(name, 'error');
    throw error;
  }
}

/**
 * Decorator for tracking performance of async functions
 */
export function Monitored(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return trackPerformance(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
