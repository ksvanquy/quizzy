/**
 * Logger Service
 * Centralized logging for the application
 * Supports different log levels and output formats
 */

import { appConfig } from '@/config/app.config';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  requestId?: string;
  userId?: string;
}

/**
 * Logger class
 * Provides structured logging with support for different levels
 */
export class Logger {
  private context: string;
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor(context: string = 'App') {
    this.context = context;
    this.isDevelopment = appConfig.server.isDevelopment;
    this.logLevel = this.parseLogLevel(appConfig.logging.level);
  }

  /**
   * Parse log level from config
   */
  private parseLogLevel(level: string): LogLevel {
    const levelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
    };
    return levelMap[level.toLowerCase()] || LogLevel.INFO;
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log entry
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      return JSON.stringify(entry, null, 2);
    }
    return JSON.stringify(entry);
  }

  /**
   * Create log entry
   */
  private createEntry(level: LogLevel, message: string, data?: any, requestId?: string, userId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      requestId,
      userId,
    };
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: any, requestId?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createEntry(LogLevel.DEBUG, message, data, requestId, userId);
    console.debug(this.formatLogEntry(entry));
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any, requestId?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createEntry(LogLevel.INFO, message, data, requestId, userId);
    console.info(this.formatLogEntry(entry));
  }

  /**
   * Warn level logging
   */
  warn(message: string, data?: any, requestId?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createEntry(LogLevel.WARN, message, data, requestId, userId);
    console.warn(this.formatLogEntry(entry));
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, data?: any, requestId?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context: this.context,
      data,
      requestId,
      userId,
    };

    if (error instanceof Error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    } else if (error) {
      entry.error = {
        message: String(error),
      };
    }

    console.error(this.formatLogEntry(entry));
  }

  /**
   * Create child logger with additional context
   */
  child(childContext: string): Logger {
    const child = new Logger(`${this.context}:${childContext}`);
    child.isDevelopment = this.isDevelopment;
    child.logLevel = this.logLevel;
    return child;
  }
}

/**
 * Create global logger instance
 */
export const globalLogger = new Logger('Quizzy');

// Legacy default logger alias for existing imports
export const logger = globalLogger;

/**
 * Get logger for a specific context
 */
export function getLogger(context: string): Logger {
  return globalLogger.child(context);
}
