import { DomainError } from './domain-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class ForbiddenError extends DomainError {
  code = 'FORBIDDEN';
  statusCode = HTTP_STATUS.FORBIDDEN;

  constructor(message: string = 'Forbidden access', details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
