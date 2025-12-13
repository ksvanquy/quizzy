import { DomainError } from './domain-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class ValidationError extends DomainError {
  code = 'VALIDATION_ERROR';
  statusCode = HTTP_STATUS.BAD_REQUEST;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
