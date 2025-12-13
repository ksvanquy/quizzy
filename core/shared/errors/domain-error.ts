/**
 * Base error class for all domain errors
 * Extends the built-in Error class with custom properties
 */
export abstract class DomainError extends Error {
  abstract code: string;
  abstract statusCode: number;
  details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}
