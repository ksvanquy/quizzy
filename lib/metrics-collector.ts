import { logger } from '@/lib/logger/logger';

/**
 * Application metrics for tracking key operations
 */
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface MetricsSnapshot {
  timestamp: string;
  uptime: number;
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  customMetrics: Record<string, number>;
}

/**
 * Metrics collector
 */
export class MetricsCollector {
  private static metrics: Map<string, number[]> = new Map();
  private static counters: Map<string, number> = new Map();
  private static startTime: number = Date.now();
  private static totalRequests: number = 0;
  private static totalErrors: number = 0;
  private static responseTimes: number[] = [];

  /**
   * Increment a counter
   */
  static increment(name: string, value: number = 1, tags?: Record<string, string>) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);

    if (tags) {
      const tagString = JSON.stringify(tags);
      const tagKey = `${name}:${tagString}`;
      const tagCurrent = this.counters.get(tagKey) || 0;
      this.counters.set(tagKey, tagCurrent + value);
    }
  }

  /**
   * Record a gauge (absolute value)
   */
  static gauge(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(value);

    // Keep last 100 values
    const values = this.metrics.get(name)!;
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Record response time
   */
  static recordResponseTime(duration: number) {
    this.responseTimes.push(duration);
    this.totalRequests++;

    // Keep last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
  }

  /**
   * Record error
   */
  static recordError(error: Error, context?: Record<string, any>) {
    this.totalErrors++;
    this.increment('errors');

    logger.error('Metric: Error recorded', {
      message: error.message,
      ...context,
    });
  }

  /**
   * Get current metrics snapshot
   */
  static getSnapshot(): MetricsSnapshot {
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    const customMetrics: Record<string, number> = {};
    for (const [key, value] of this.counters) {
      if (!key.includes(':')) {
        customMetrics[key] = value;
      }
    }

    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgResponseTime,
      memoryUsage: process.memoryUsage(),
      customMetrics,
    };
  }

  /**
   * Get counter value
   */
  static getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Get gauge average
   */
  static getGaugeAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Reset metrics
   */
  static reset() {
    this.metrics.clear();
    this.counters.clear();
    this.responseTimes = [];
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.startTime = Date.now();
  }

  /**
   * Report metrics
   */
  static report() {
    const snapshot = this.getSnapshot();
    logger.info('Metrics snapshot', {
      uptime: `${Math.floor(snapshot.uptime / 1000)}s`,
      totalRequests: snapshot.totalRequests,
      totalErrors: snapshot.totalErrors,
      avgResponseTime: `${Math.round(snapshot.avgResponseTime)}ms`,
      memory: {
        heapUsed: `${Math.round(snapshot.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(snapshot.memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(snapshot.memoryUsage.external / 1024 / 1024)}MB`,
      },
    });
  }
}

/**
 * Metrics middleware
 */
export function metricsMiddleware(
  method: string,
  path: string,
  statusCode: number,
  duration: number
) {
  MetricsCollector.recordResponseTime(duration);
  MetricsCollector.increment(`requests.${method}`);
  MetricsCollector.increment(`requests.status.${statusCode}`);
  MetricsCollector.gauge(`response_time.${path}`, duration);

  if (statusCode >= 400) {
    MetricsCollector.increment('errors.http');
  }
}
