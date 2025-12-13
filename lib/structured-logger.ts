import { logger } from '@/lib/logger/logger';

/**
 * Structured logging for better log parsing and analysis
 */
export interface StructuredLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service: string;
  version: string;
  environment: string;
  userId?: string;
  requestId?: string;
  traceId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * Structured logger
 */
export class StructuredLogger {
  private static service: string = 'quizzy';
  private static version: string = '1.0.0';
  private static environment: string = process.env.NODE_ENV || 'development';
  private static requestContext: Map<string, Partial<StructuredLogEntry>> = new Map();

  /**
   * Set request context
   */
  static setRequestContext(requestId: string, context: Partial<StructuredLogEntry>) {
    this.requestContext.set(requestId, context);
  }

  /**
   * Get request context
   */
  static getRequestContext(requestId: string): Partial<StructuredLogEntry> | undefined {
    return this.requestContext.get(requestId);
  }

  /**
   * Clear request context
   */
  static clearRequestContext(requestId: string) {
    this.requestContext.delete(requestId);
  }

  /**
   * Log structured entry
   */
  static log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    metadata?: Record<string, any>,
    requestId?: string
  ) {
    const context = requestId ? this.getRequestContext(requestId) : {};

    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      version: this.version,
      environment: this.environment,
      userId: context?.userId,
      requestId: context?.requestId || requestId,
      traceId: context?.traceId,
      tags: metadata?.tags,
      metadata: { ...metadata },
    };

    // Output as JSON for log aggregation tools
    if (process.env.LOG_FORMAT === 'json') {
      console.log(JSON.stringify(entry));
    } else {
      logger[level](message, metadata);
    }
  }

  /**
   * Log API request
   */
  static logRequest(
    method: string,
    path: string,
    requestId: string,
    userId?: string,
    queryParams?: Record<string, any>
  ) {
    this.setRequestContext(requestId, {
      requestId,
      userId,
    });

    this.log('info', `${method} ${path}`, {
      type: 'request',
      method,
      path,
      queryParams,
    });
  }

  /**
   * Log API response
   */
  static logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    bytes?: number
  ) {
    this.log(
      statusCode >= 400 ? 'warn' : 'info',
      `Response ${statusCode}`,
      {
        type: 'response',
        statusCode,
        duration: `${duration}ms`,
        bytes,
      },
      requestId
    );

    this.clearRequestContext(requestId);
  }

  /**
   * Log business event
   */
  static logEvent(
    eventName: string,
    eventData: Record<string, any>,
    requestId?: string
  ) {
    this.log('info', `Event: ${eventName}`, {
      type: 'event',
      eventName,
      ...eventData,
    });
  }

  /**
   * Log error with context
   */
  static logErrorWithContext(
    error: Error,
    context: string,
    metadata?: Record<string, any>,
    requestId?: string
  ) {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      service: this.service,
      version: this.version,
      environment: this.environment,
      requestId,
      metadata,
      error: {
        code: (error as any).code || 'UNKNOWN_ERROR',
        message: error.message,
        stack: error.stack,
      },
    };

    if (process.env.LOG_FORMAT === 'json') {
      console.error(JSON.stringify(entry));
    } else {
      logger.error(context, { error: entry });
    }
  }

  /**
   * Log performance
   */
  static logPerformance(
    operationName: string,
    duration: number,
    status: 'success' | 'error',
    metadata?: Record<string, any>
  ) {
    this.log(
      status === 'error' ? 'warn' : 'info',
      `Performance: ${operationName}`,
      {
        type: 'performance',
        operation: operationName,
        duration: `${duration}ms`,
        status,
        ...metadata,
      }
    );
  }

  /**
   * Log audit trail
   */
  static logAudit(
    action: string,
    actor: string,
    resource: string,
    result: 'success' | 'failure',
    metadata?: Record<string, any>
  ) {
    this.log('info', `Audit: ${action}`, {
      type: 'audit',
      action,
      actor,
      resource,
      result,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }
}
