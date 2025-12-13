import { NextRequest } from 'next/server';

/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */
export class InputSanitizer {
  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .substring(0, 5000); // Limit length
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(input: string): string {
    const email = this.sanitizeString(input).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : '';
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(input: string): string {
    try {
      const url = new URL(input);
      if (!url.protocol.startsWith('http')) return '';
      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize number
   */
  static sanitizeNumber(input: any): number {
    const num = Number(input);
    return isFinite(num) ? num : 0;
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeStringArray(input: any[]): string[] {
    if (!Array.isArray(input)) return [];
    return input
      .filter((item) => typeof item === 'string')
      .map((item) => this.sanitizeString(item));
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    if (typeof obj !== 'object' || obj === null) {
      return {};
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = this.sanitizeNumber(value);
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      }
    }

    return sanitized;
  }
}

/**
 * Extract and validate query parameters
 */
export function extractQueryParams(request: NextRequest): Record<string, any> {
  const params: Record<string, any> = {};

  request.nextUrl.searchParams.forEach((value, key) => {
    // Sanitize key and value
    const sanitizedKey = InputSanitizer.sanitizeString(key);
    const sanitizedValue = InputSanitizer.sanitizeString(value);

    if (sanitizedKey) {
      params[sanitizedKey] = sanitizedValue;
    }
  });

  return params;
}
