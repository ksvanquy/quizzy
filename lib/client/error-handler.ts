import { AxiosError } from 'axios';
import { ApiResponse } from '../../types/api.types';
import { getLogger } from '../logger/logger';

const logger = getLogger('api-error-handler');

/**
 * API Error Handler
 * Transforms API errors into user-friendly messages
 */
export class ApiErrorHandler {
  static handle(error: unknown): ApiErrorResponse {
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error);
    }

    if (error instanceof Error) {
      return this.handleError(error);
    }

    return this.handleUnknownError(error);
  }

  private static handleAxiosError(error: AxiosError<ApiResponse<any>>): ApiErrorResponse {
    const response = error.response?.data;
    const status = error.response?.status || 500;

    const errorCode = response?.error?.code || 'UNKNOWN_ERROR';
    const errorMessage = response?.error?.message || error.message || 'An error occurred';

    logger.error('AxiosError', {
      status,
      code: errorCode,
      message: errorMessage,
      details: response?.error,
    });

    return {
      status,
      code: errorCode,
      message: errorMessage,
      details: response?.error?.details,
      isAxiosError: true,
    };
  }

  private static handleError(error: Error): ApiErrorResponse {
    logger.error('Error', {
      message: error.message,
      stack: error.stack,
    });

    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred',
      isAxiosError: false,
    };
  }

  private static handleUnknownError(error: unknown): ApiErrorResponse {
    logger.error('UnknownError', {
      error: String(error),
    });

    return {
      status: 500,
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      isAxiosError: false,
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    const errorResponse = this.handle(error);

    // Map error codes to user-friendly messages
    const messageMap: Record<string, string> = {
      VALIDATION_ERROR: 'Please check your input and try again',
      NOT_FOUND: 'The resource you are looking for was not found',
      UNAUTHORIZED: 'Please log in to continue',
      FORBIDDEN: 'You do not have permission to access this resource',
      CONFLICT: 'This resource already exists',
      INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
    };

    return messageMap[errorResponse.code] || errorResponse.message;
  }
}

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
  isAxiosError: boolean;
}
