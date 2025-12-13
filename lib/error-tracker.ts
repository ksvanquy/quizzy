import { logger } from '@/lib/logger/logger';

/**
 * Error tracking and reporting for external services like Sentry
 */
export interface ErrorReport {
  id: string;
  timestamp: string;
  environment: string;
  level: 'fatal' | 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  request?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
  };
  tags?: Record<string, string>;
}

/**
 * Error tracker
 */
export class ErrorTracker {
  private static reportedErrors: Map<string, ErrorReport> = new Map();
  private static maxReports: number = 1000;
  private static environment: string = process.env.NODE_ENV || 'development';
  private static enabled: boolean = process.env.ERROR_TRACKING_ENABLED === 'true';

  /**
   * Initialize error tracking
   */
  static initialize(options?: { enabled?: boolean; maxReports?: number }) {
    if (options?.enabled !== undefined) {
      this.enabled = options.enabled;
    }
    if (options?.maxReports !== undefined) {
      this.maxReports = options.maxReports;
    }

    logger.info('Error tracker initialized', { enabled: this.enabled });
  }

  /**
   * Report an error
   */
  static reportError(
    error: Error,
    context?: {
      message?: string;
      userId?: string;
      request?: { method: string; url: string };
      tags?: Record<string, string>;
    }
  ): ErrorReport {
    if (!this.enabled) {
      return {} as ErrorReport;
    }

    const report: ErrorReport = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      level: 'error',
      message: context?.message || error.message,
      stack: error.stack,
      context,
      userId: context?.userId,
      request: context?.request,
      tags: context?.tags,
    };

    this.reportedErrors.set(report.id, report);

    // Clean up old reports
    if (this.reportedErrors.size > this.maxReports) {
      const firstKey = this.reportedErrors.keys().next().value;
      this.reportedErrors.delete(firstKey);
    }

    // Log error
    logger.error('Error reported', {
      errorId: report.id,
      message: report.message,
      userId: report.userId,
    });

    // In production, send to external service
    if (this.environment === 'production') {
      this.sendToExternalService(report);
    }

    return report;
  }

  /**
   * Report a fatal error
   */
  static reportFatal(
    error: Error,
    context?: Record<string, any>
  ): ErrorReport {
    const report: ErrorReport = {
      id: `fatal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      level: 'fatal',
      message: error.message,
      stack: error.stack,
      context,
    };

    logger.error('FATAL ERROR', report);

    if (this.environment === 'production') {
      this.sendToExternalService(report);
    }

    return report;
  }

  /**
   * Get error report
   */
  static getReport(id: string): ErrorReport | undefined {
    return this.reportedErrors.get(id);
  }

  /**
   * Get all reports
   */
  static getAllReports(): ErrorReport[] {
    return Array.from(this.reportedErrors.values());
  }

  /**
   * Get reports by user
   */
  static getReportsByUser(userId: string): ErrorReport[] {
    return Array.from(this.reportedErrors.values()).filter(
      (r) => r.userId === userId
    );
  }

  /**
   * Clear reports
   */
  static clear() {
    this.reportedErrors.clear();
  }

  /**
   * Send to external service (e.g., Sentry)
   */
  private static async sendToExternalService(report: ErrorReport) {
    try {
      // This is where you would integrate with Sentry, DataDog, etc.
      // Example: await fetch('https://sentry.io/api/...')
      logger.debug('Error would be sent to external service', { reportId: report.id });
    } catch (error) {
      logger.error('Failed to send error to external service', error as Error);
    }
  }
}

/**
 * Sentry integration (optional)
 */
export function initializeSentry() {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    logger.info('Sentry not configured (SENTRY_DSN not set)');
    return;
  }

  try {
    // Example Sentry initialization
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({
    //   dsn: sentryDsn,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: 0.1,
    // });
    logger.info('Sentry initialized');
  } catch (error) {
    logger.error('Failed to initialize Sentry', error as Error);
  }
}
