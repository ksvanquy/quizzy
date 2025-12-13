import { DomainError } from './domain-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class ConflictError extends DomainError {
  code = 'CONFLICT';
  statusCode = HTTP_STATUS.CONFLICT;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
