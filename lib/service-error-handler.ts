import { logger } from '@/lib/logger/logger';

/**
 * Service error handling utilities
 */
export class ServiceErrorHandler {
  /**
   * Handle error and log it with context
   */
  static handle(
    error: unknown,
    context: string,
    additionalInfo?: Record<string, any>
  ): Error {
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error(`Service Error in ${context}`, {
      message: err.message,
      stack: err.stack,
      ...additionalInfo,
    });

    return err;
  }

  /**
   * Handle and throw error with better context
   */
  static throwWithContext(
    error: unknown,
    context: string,
    message?: string
  ): never {
    const err = error instanceof Error ? error : new Error(String(error));
    const contextError = new Error(message || err.message);
    contextError.cause = err;

    logger.error(`Service Error: ${context}`, {
      originalError: err.message,
      contextMessage: message,
      stack: contextError.stack,
    });

    throw contextError;
  }
}

/**
 * Async wrapper with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    ServiceErrorHandler.handle(error, context);
    throw error;
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Retry attempt ${attempt + 1}, waiting ${delay}ms`, {
          error: lastError.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed after retries');
}
