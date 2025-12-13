import {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { ApiResponse } from '../../types/api.types';
import { getAccessToken, setAccessToken, removeTokens } from '../utils/jwt';
import { getLogger } from '../logger/logger';

const logger = getLogger('api-interceptors');

/**
 * Request Interceptor
 * Adds authorization header and request ID
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  const requestId = crypto.randomUUID();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Request-ID'] = requestId;

  logger.debug('API Request', {
    method: config.method?.toUpperCase(),
    url: config.url,
    requestId,
  });

  return config;
};

/**
 * Response Interceptor
 * Logs successful responses
 */
export const responseInterceptor = (response: AxiosResponse<ApiResponse<any>>) => {
  const requestId = response.config.headers['X-Request-ID'];

  logger.debug('API Response', {
    method: response.config.method?.toUpperCase(),
    url: response.config.url,
    status: response.status,
    requestId,
  });

  return response;
};

/**
 * Error Interceptor
 * Handles errors and token refresh logic
 */
export const errorInterceptor = async (error: AxiosError<ApiResponse<any>>) => {
  const requestId = error.config?.headers['X-Request-ID'];

  // Handle 401 Unauthorized - token expired
  if (error.response?.status === 401) {
    logger.warn('Unauthorized - removing tokens', {
      requestId,
      url: error.config?.url,
    });

    removeTokens();
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  // Log error
  logger.error('API Error', {
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    status: error.response?.status,
    code: error.response?.data?.error?.code,
    message: error.response?.data?.error?.message || error.message,
    requestId,
  });

  return Promise.reject(error);
};
