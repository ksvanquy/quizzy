import { DomainError } from './domain-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class InternalServerError extends DomainError {
  code = 'INTERNAL_SERVER_ERROR';
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

  constructor(message: string = 'Internal server error', details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
