/**
 * API Types
 * Request/Response and utility types for API layer
 */

import { HTTP_STATUS } from '@/constants/http-status';
import { ERROR_CODES } from '@/constants/error-codes';

/**
 * Standard API Response Format
 * All API endpoints should return this format
 */
export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path?: string;
  method?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination Query Parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Request Metadata
 */
export interface RequestMeta {
  userId?: string;
  userRole?: string;
  timestamp: string;
  requestId: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  };
  timestamp: string;
  path?: string;
}

/**
 * Success Response
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Generic API Error
 */
export class ApiError extends Error {
  constructor(
    public code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
    public statusCode: (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS],
    public message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation Error Details
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

/**
 * Async Handler Result
 */
export type AsyncHandlerResult<T> = Promise<ApiResponse<T> | Response>;
