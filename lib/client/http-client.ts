/**
 * HTTP Client Base
 * Centralized HTTP request handling for client-side
 */

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

export interface ResponseData<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: {
    request: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>;
    response: Array<(response: any) => any | Promise<any>>;
    error: Array<(error: Error) => Error | Promise<Error>>;
  };

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ) {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(
    interceptor: (response: any) => any | Promise<any>
  ) {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(
    interceptor: (error: Error) => Error | Promise<Error>
  ) {
    this.interceptors.error.push(interceptor);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    // Support relative base like '/api' by resolving against window.origin
    let base = this.baseURL;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (!base) base = origin;
      else if (base.startsWith('/')) base = origin + base;
    }
    const url = new URL(path, base);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, v));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Build request config
   */
  private buildRequestConfig(config: RequestConfig): RequestConfig {
    return {
      method: config.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      ...config,
    };
  }

  /**
   * Execute request with retries
   */
  private async executeWithRetries(
    url: string,
    config: RequestConfig,
    attempt: number = 0
  ): Promise<Response> {
    try {
      const fetchConfig: RequestInit = {
        method: config.method,
        headers: config.headers,
      };

      if (config.body) {
        fetchConfig.body = typeof config.body === 'string'
          ? config.body
          : JSON.stringify(config.body);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeout);

      try {
        const response = await fetch(url, {
          ...fetchConfig,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        return response;
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    } catch (error) {
      if (attempt < (config.retries || 3) - 1) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetries(url, config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(
    path: string,
    config: RequestConfig = {}
  ): Promise<ResponseData<T>> {
    try {
      // Build config
      let requestConfig = this.buildRequestConfig(config);

      // Apply request interceptors
      for (const interceptor of this.interceptors.request) {
        requestConfig = await interceptor(requestConfig);
      }

      // Build URL
      const url = this.buildUrl(path, requestConfig.params);

      // Execute request
      const response = await this.executeWithRetries(url, requestConfig);

      // Check response status
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          code: 'HTTP_ERROR',
          message: `HTTP ${response.status}`,
        }));
        throw new Error(JSON.stringify(error));
      }

      // Parse response
      let data = await response.json();

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        data = await interceptor(data);
      }

      return data;
    } catch (error) {
      // Apply error interceptors
      for (const interceptor of this.interceptors.error) {
        error = await interceptor(error as Error);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(path: string, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    path: string,
    body?: any,
    config: RequestConfig = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    path: string,
    body?: any,
    config: RequestConfig = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    path: string,
    config: RequestConfig = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    path: string,
    body?: any,
    config: RequestConfig = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...config, method: 'PATCH', body });
  }
}
