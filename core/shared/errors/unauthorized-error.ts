import { DomainError } from './domain-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class UnauthorizedError extends DomainError {
  code = 'UNAUTHORIZED';
  statusCode = HTTP_STATUS.UNAUTHORIZED;

  constructor(message: string = 'Unauthorized access', details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
